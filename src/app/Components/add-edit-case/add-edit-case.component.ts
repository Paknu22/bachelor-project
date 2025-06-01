import { Component, Input, OnInit, ViewChild, input } from '@angular/core';
import { ModalController, IonicModule, IonInput } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeaheadModalService } from 'src/app/Services/Typeahead/typeahead.service';
import { Item } from 'src/app/Interfaces/types';
import { FilePickerService } from 'src/app/Services/FilePicker/file-picker.service';
import { LocalFile } from 'src/app/Interfaces/LocalFile';
import { FileDisplayComponent } from '../file-display/file-display.component';
import { Subscription } from 'rxjs';
import { SupabaseService } from 'src/app/supabase.service';
import { firstValueFrom } from 'rxjs';

interface AdditionalTasks {
  id: number;
  name: string;
}


@Component({
  selector: 'app-add-edit-case',
  templateUrl: './add-edit-case.component.html',
  styleUrls: ['./add-edit-case.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, FileDisplayComponent]
})
export class AddEditCaseComponent implements OnInit {
  @ViewChild('caseTitleInput', { static: false }) caseTitleInput!: IonInput;


  images: LocalFile[] = [];
  private imagesSub?: Subscription;

  selectedAdditionalTasks : string[] = [];

  constructor(
    private modalController: ModalController,
    private typeaheadModal: TypeaheadModalService,
    private filePickerService: FilePickerService,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    this.imagesSub = this.filePickerService.images$.subscribe(images => {
      this.images = images;
    });
    this.filePickerService.loadFiles(); //Load images initially
    this.loadEmployeesInCompany()
  }

  ngOnDestroy() {
    this.imagesSub?.unsubscribe(); //Always clean up subscriptions!
  }

  AddBluePrint() {
    this.filePickerService.selectFile();
  }

  async dismiss() {
    this.images.pop();
    await this.filePickerService.clearSessionFiles(); //Await cleanup before closing
    this.modalController.dismiss();
  }

  additionalTasks: AdditionalTasks[] = [
    {
      id: 1,
      name: 'Price',
    },
  ];

  compareWith(o1: AdditionalTasks | null, o2: AdditionalTasks | AdditionalTasks[] | null): boolean {
    if (!o1 || !o2) {
      return o1 === o2;
    }

    if (Array.isArray(o2)) {
      return o2.some((o) => o.id === o1.id);
    }

    return o1.id === o2.id;
  }

  handleChange(event: Event) {
    const target = event.target as HTMLIonSelectElement;
    const selected = target.value as AdditionalTasks | AdditionalTasks[];
    
    console.log('Current value:', JSON.stringify(target.value));
      if (Array.isArray(selected)) {
      this.selectedAdditionalTasks = selected.map((task) => task.id.toString());
    } else {
      this.selectedAdditionalTasks = [selected.id.toString()];
    }
      console.log("This is selected tasks id: ", this.selectedAdditionalTasks);   
  }

  isAllSelected = false;

  addOrRemoveAll() {
    if (this.isAllSelected) {
      this.selectedEmployees = [];
    } else {
      this.selectedEmployees = []
      this.selectedEmployees = this.employees.map(e => e.value);
    }
  
    this.isAllSelected = !this.isAllSelected;
    this.selectedEmployeesText = this.typeaheadModal.formatSelectedItems(
      this.selectedEmployees,
      this.employees,
    );
  }
  async addOrRemoveEmployees() {
    const selected = await this.typeaheadModal.open({
      title: 'Select Employees',
      items: this.employees,
      selectedItems: this.selectedEmployees,
    });
  
    if (selected) {
      this.selectedEmployees = selected;
      this.selectedEmployeesText = this.typeaheadModal.formatSelectedItems(
        selected,
        this.employees,
        { labelFallback: 'Employees' }
      );
    }
  }

  selectedEmployeesText = '0 Employees';
  selectedEmployees: string[] = [];

  employees: Item[] = [];

  async loadEmployeesInCompany() {
    const userDetails = await this.supabaseService.getUserDetails();
  
    const rawEmployees = await this.supabaseService.getUsersByCompany(userDetails?.company_id);
  
    // Convert raw Supabase users into Item[]
    this.employees = rawEmployees.map(user => ({
      value: user.id,
      text: user.name || user.email || 'Unnamed User',
    }));
  }
  


  async SaveCaseToDatabase() {
    try {
      const userDetails = await this.supabaseService.getUserDetails();
      const nativeInput = await this.caseTitleInput.getInputElement();
  
      const companyId = userDetails?.company_id;
      const caseTitle = nativeInput.value?.trim();

      console.log("Company ID: " , companyId, "   caseTitle: ", caseTitle);
      
  
      if (!caseTitle || !companyId) {
        throw new Error('Missing case title or company ID');
      }
  
      const caseDataArray = await this.supabaseService.createCase(companyId, caseTitle);
      const caseResult = Array.isArray(caseDataArray) ? caseDataArray[0] : caseDataArray;
  
      const caseId = caseResult.id;
  
      const filesToUpload = await firstValueFrom(this.filePickerService.images$);
      
      console.log("CaseId: ", caseId, "   Files: ", filesToUpload);
  
      await this.supabaseService.UploadCaseFiles(caseId, filesToUpload);
  
      await this.filePickerService.clearSessionFiles();
      this.modalController.dismiss();

      this.selectedEmployees.forEach(element => {
        this.supabaseService.addUserToCase(caseId, element)
      });

      this.selectedAdditionalTasks.forEach(element => {
        this.supabaseService.addCaseCustomTask(caseId, element)
      });
  
    } catch (error) {
      console.error('Error saving case and uploading files:', error);
    }
  }
  
  
}
