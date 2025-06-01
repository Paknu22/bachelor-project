import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccordionComponent } from 'src/app/Components/accordion/accordion.component';
import { AccordionItem } from 'src/app/Interfaces/accordion';
import { SupabaseService } from 'src/app/supabase.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FilePickerService } from 'src/app/Services/FilePicker/file-picker.service';
import { LocalFile } from 'src/app/Interfaces/LocalFile';
import { Subscription } from 'rxjs';
import { ImageDisplayComponent } from 'src/app/Components/image-display/image-display.component';
import { ImageViewerComponent } from 'src/app/Components/image-viewer/image-viewer.component';
import { ModalController } from '@ionic/angular';
import { BlueprintStaticViewerComponent } from 'src/app/Components/blueprint-static-viewer/blueprint-static-viewer.component';
import { PullToRefreshComponent } from 'src/app/Components/pull-to-refresh/pull-to-refresh.component';

@Component({
  selector: 'app-task-page',
  templateUrl: './TaskPage.page.html',
  styleUrls: ['./TaskPage.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, AccordionComponent, ImageDisplayComponent, BlueprintStaticViewerComponent, PullToRefreshComponent]
})
export class TaskPage {

  descriptionText: string = "";
  registrationType: string = "";


  //For blueprints
  blueprintAccordionData: AccordionItem[] = [];
  blueprintAccordionTitle: string = "Choose Blueprint To Point";
  hasPointedOnBlueprint: boolean = false;
  selectedBlueprintPath = '';
  selectedBlueprintPoint = { x: 0, y: 0 };


  //For user logs data
  changeLogAccordionData: AccordionItem[] = [];
  userLogsAccordionTitle: string = "User Logs";

  currentTaskId: string | null = "";
  currentCaseId: string | null = "";

  images: LocalFile[] = [];
  private imagesSub?: Subscription;

  price: string = '';
  isPriceActive = false;

  constructor(
    private supabaseService: SupabaseService,
    private route: ActivatedRoute,
    private router: Router,
    private filePickerService: FilePickerService,
    private modalController: ModalController,
  ) {}

  async ngOnInit() {
    this.currentTaskId = this.route.snapshot.paramMap.get('taskId');
    this.currentCaseId = this.route.snapshot.paramMap.get('caseId');
    await this.loadTask();    
  }

  goToCase() {
    this.router.navigate(['/case', this.currentCaseId])
  }

  async takePicture() {
    if (!this.currentTaskId) {
      throw new Error("Task ID not found in route parameters.");
    }

    const newImage = await this.filePickerService.captureImage();
    if (newImage) {
      await this.supabaseService.UploadTaskImage(this.currentTaskId, newImage);
      this.images = await this.supabaseService.RetrieveTaskImages(this.currentTaskId);
    }
  }




  async dismiss() {
    this.images.pop();
    await this.filePickerService.clearSessionFiles();
  }

  async loadBlueprints() {
    if (!this.currentCaseId) {
      throw new Error("Case ID not found in route parameters.");
    }

    const blueprints = await this.supabaseService.RetrieveCaseFiles(this.currentCaseId);

    this.blueprintAccordionData = blueprints.map((blueprint, index) => {
      return {
        id: `blueprints-${index}`,
        title: 'Blueprint',
        content: [
          {
            optionalText: blueprint.path,
            value: blueprint.name,
            url: blueprint.url
          }
        ]
      };
    });    
  }


  async clickBlueprint(accordionItem: AccordionItem) {
    if (!this.currentTaskId) {
      throw new Error("Task ID not found in route parameters.");
    }
    const blueprintButton = accordionItem.content[0];

    const modal = await this.modalController.create({
      component: ImageViewerComponent,
      componentProps: {
        imageSrc: blueprintButton.url
      }
    });

    await modal.present();

    setTimeout(() => {
      const ionModal = document.querySelector('ion-modal');
      const focusTarget = ionModal?.querySelector('canvas') as HTMLElement;
      focusTarget?.focus();
    }, 50);

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.selectedBlueprintPoint = data;

      const signedUrl = await this.supabaseService.generateSignedUrl(
        'case-files',
        blueprintButton.optionalText
      );

      this.selectedBlueprintPath = signedUrl;

      await this.supabaseService.uploadBlueprintPoint(
        this.currentTaskId,
        this.selectedBlueprintPoint,
        blueprintButton.optionalText
      );

      this.hasPointedOnBlueprint = true;
      console.log("Signed URL for selected blueprint:", signedUrl);
      this.loadBlueprintPoint(blueprintButton.optionalText);
    }

  }



  async loadChangeLog() {
  
    if (!this.currentTaskId) {
      throw new Error("Task ID not found in route parameters.");
    }
  
    const logs = await this.supabaseService.loadUserLog(this.currentTaskId);
    
    this.changeLogAccordionData = logs.map((log, index) => {
      const date = new Date(log.timestamp);
      const formattedDate = isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
  
      return {
        id: `log-${index}`,
        title: 'User logs',
        content: [
          {
            optionalText: '',
            value: `${log.name} made a change: ${formattedDate}`,
            url: ""
          }
        ]
      };
    });
  
  }
  
  

  async saveTask(){
    const userDetails = await this.supabaseService.getUserDetails(); 

    if (!this.currentTaskId) {
      throw new Error("Task ID not found in route parameters.");
    }
    
    this.supabaseService.saveUserLog(userDetails.id, this.currentTaskId);
    this.supabaseService.updateTask(this.currentTaskId, this.descriptionText, this.registrationType)
    if (this.isPriceActive){
      this.supabaseService.updateTaskAttribute(this.currentTaskId, "1", this.price);
    }
    
    this.dismiss();

    this.goToCase();
  }

  async loadBlueprintPoint(file_path_blueprint: string){
    if (file_path_blueprint) {
        this.selectedBlueprintPath = await this.supabaseService.generateSignedUrl(
          'case-files',
          file_path_blueprint
        );
      this.hasPointedOnBlueprint = true;
    }
  }


  async loadTask() {
    if (!this.currentTaskId || !this.currentCaseId) {
      throw new Error("Task ID not found in route parameters.");
    }

    const taskData = await this.supabaseService.loadTask(this.currentTaskId);
    this.descriptionText = taskData.description;
    this.registrationType = taskData.type;

    this.selectedBlueprintPoint = taskData.point_on_blueprint;
    this.loadBlueprintPoint(taskData.file_path_blueprint)

    console.log(taskData.file_path_blueprint);
    
    const taskAttributes = await this.supabaseService.loadTaskAttribute(this.currentTaskId);
    console.log("Task attribute", taskAttributes);
    
    const priceAttribute = taskAttributes.find(attr => attr.attribute_id === 1);
    if (priceAttribute){
      this.isPriceActive = !!priceAttribute;
      if (this.isPriceActive) {
        this.price = priceAttribute.value;
      }
    }

    this.images = await this.supabaseService.RetrieveTaskImages(this.currentTaskId);
    this.loadBlueprints();
    this.loadChangeLog();
  }

  async refreshPage(): Promise<void> {
    window.location.reload();
  }

  onPriceInput(event: any): void {
    let value = event.target.value;

    //Makes it so it it can only input numbers
    value = value.replace(/[^0-9.]/g, '');


    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts[1];
    }

    //Limits to two decimals
    if (parts[1]?.length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }

    this.price = value;
  }
}