import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { BurgerMenuComponent } from 'src/app/Components/burger-menu/burger-menu.component';
import { ModalService } from 'src/app/Services/Modal/modal.service';
import { MultipleSelectionsService } from 'src/app/Services/Multiple-Selections/multiple-selections.service';
import { MultipleSelectionComponent } from 'src/app/Components/multiple-selection/multiple-selection.component';
import { Item } from 'src/app/Interfaces/types';
import { SupabaseService } from 'src/app/supabase.service';
import { ActivatedRoute } from '@angular/router';
import { UserSessionService } from 'src/app/UserSessionService';
import { Roles } from 'src/app/Enums/roles.enum';
import { RouterLink } from '@angular/router';
import { PullToRefreshComponent } from 'src/app/Components/pull-to-refresh/pull-to-refresh.component';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';
const PdfSaver = registerPlugin<{ savePdf(options: { data: number[] }): Promise<void> }>('PdfSaver');


//For pdfs
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


declare var navigator: any;


@Component({
  selector: 'Case-Page',
  templateUrl: 'CasePage.page.html',
  styleUrls: ['CasePage.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, BurgerMenuComponent, MultipleSelectionComponent, RouterLink, PullToRefreshComponent]
})

export class CasePage {

  caseId!: number;
  public caseTitle: string = "Case Name"; //Setting this as default
  //PDF gen thing
  async generatePdf() {
    const selectedTasks = this.data.filter(task => task.selected);

    if (selectedTasks.length === 0) {
      console.warn('No tasks selected for printing.');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Selected Tasks Report', 14, 20);

    const tableData = selectedTasks.map(task => [task.id, task.type, task.description]);
    autoTable(doc, {
      head: [['ID', 'Type', 'Description']],
      body: tableData,
      startY: 30,
    });

    if (Capacitor.isNativePlatform()) {
      try {
        const pdfBlob = doc.output('blob');
        const buffer = await pdfBlob.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);

        await PdfSaver.savePdf({
          data: Array.from(uint8Array)
        });

        alert('PDF saved using Android file picker!');
      } catch (error) {
        console.error('Custom plugin save failed:', error);
        alert('Save failed: ' + (error instanceof Error ? error.message : JSON.stringify(error)));
      }
    } else {
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: 'Selected_Tasks_Report.pdf',
            types: [{
              description: 'PDF file',
              accept: {'application/pdf': ['.pdf']},
            }],
          });

          const writable = await handle.createWritable();
          const pdfBlob = doc.output('blob');
          await writable.write(pdfBlob);
          await writable.close();
          alert('PDF saved successfully.');
        } catch (error) {
          console.error('Save canceled or failed:', error);
        }
      } else {
        doc.save('Selected_Tasks_Report.pdf');
      }
    }
  }



  async requestStoragePermission() {
    if (this.platform.is('android') && Capacitor.isNativePlatform()) {
      const result = await Filesystem.checkPermissions();
      if (result.publicStorage !== 'granted') {
        const permResult = await Filesystem.requestPermissions();
        console.log('Filesystem permissions requested:', permResult);
      }
    }
  }

  constructor(
    private router: Router, 
    private modalService: ModalService, 
    private multipleSelectionService: MultipleSelectionsService,
    private supabaseService: SupabaseService,
    private route: ActivatedRoute,
    private userSessionService: UserSessionService,
    private platform: Platform,
  ) {
    if (this.platform.is('android')) {
      console.log('Running on Android');
    }
  }

  ngOnInit() {
    this.multipleSelectionService.setItemsFor('tags', [
      { text: 'Supervision', value: 'Supervision', },
      { text: 'Error', value: 'Error', },
      { text: 'Documentation', value: 'Documentation'}
    ]);

    const idParam = this.route.snapshot.paramMap.get('id'); //Gets the case id, so it knows what tasks to get
    if (!idParam) {
      console.error('No case ID in route');
      return;
    }
    this.caseId = Number(idParam)
    this.loadCase(this.caseId);
    
  }

  menuItems = [
    ...(this.userSessionService.hasRole(Roles.SuperUser)
    ? [{ icon: 'person-add', label: 'Add employees to case', action: () => this.openAddEmployeeModal() }]
    : []),
    ...(this.userSessionService.hasRole(Roles.SuperUser) || this.userSessionService.hasRole(Roles.ProjectManager)
    ? [{ icon: 'people', label: 'Manage employees in case', action: () => this.modalService.openViewCaseEmployeesModal(this.caseId) }]
    : []),
    { icon: 'person-circle', label: 'account', action: () => this.navTo('/account') },
  ];
  
  navTo(route: string) {
    this.router.navigate([route])
  }

  openAddEmployeeModal() {
    this.modalService.openAddEmployeeToCaseModal(this.caseId);
  }

  saveEmployeeToCase(){
    console.log("Adding employee to case");
  }

  addEmployeeBtn = { label: 'Add to Case', action: () => this.saveEmployeeToCase()};

  data: any[] = [];

  async loadCase(caseId: number){
    const caseData = await this.supabaseService.getCasesById(caseId);
    this.caseTitle = caseData.title;
    console.log("Case data: ", caseData);
    
    console.log("Case title ", this.caseTitle);
    
    this.loadTasks(caseId);
  }

  async loadTasks(caseId: number) {
    try {
      const tasks = await this.supabaseService.getTasksByCase(caseId);
      
      this.data = tasks.map(task => ({
        ...task,
        selected: false 
      }));
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
    console.log('Mapped task data:', this.data);
  }

/* Mock data
  data = [
    { selected: false, id: 'R1', type: "Error", description: 'This is item 1' },
    { selected: false, id: 'R2', type: "Error", description: 'Item 2' },
    { selected: false, id: 'R3', type: "Super", description: 'Item 3' },
    { selected: false, id: 'R4', type: "Error", description: 'Item 1' },
    { selected: false, id: 'R5', type: "Error", description: 'Item 2' },
    { selected: false, id: 'R6', type: "Super", description: 'Item 3' },
    { selected: false, id: 'R7', type: "Error", description: 'Item 1' },
    { selected: false, id: 'R8', type: "Error", description: 'Item 2' },
    { selected: false, id: 'R9', type: "Super", description: 'Item 3' },
    { selected: false, id: 'R10', type: "Documentation", description: 'Item 1' },
  ];
  */

  onRowClick(item: any) {
    console.log('Row clicked:', item);
  }

  showPdfSelectionCol: boolean = false;
  TogglePdfSelectionCol(){
    this.showPdfSelectionCol = !this.showPdfSelectionCol;
  }

  ToggleCheckbox(item: any, event: Event) {
    event.stopPropagation(); //Prevents clicking on the row when trying to click checkbox
    item.selected = !item.selected; // Toggles checkbox
  }

  selectedTags: Item[] = [];

  OnTagsSelectionChanged(selectedItems: Item[]) {
    /*const selectedValues = selectedItems.map(i => i.value);
    const allWasSelected = selectedValues.includes('all');
    const allWasPreviouslySelected = this.selectedTags.map(i => i.value).includes('all');
  
    if (allWasSelected && !allWasPreviouslySelected) {
      this.selectAllTags();
      this.OnCheckAllBoxes(true);
    } else if (!allWasSelected && allWasPreviouslySelected) {
      this.deselectAllTags();
      this.OnCheckAllBoxes(false);
    } else */

    //Couldnt make "All" work visually with the other selections so it will be on hold for now
    //Rest works though
    const selectedValues = selectedItems.map(i => i.value);
      
    this.OnCheckAllBoxes(false); //This deselects the boxes
  
    // Then selectively check only the selected tags
    selectedValues.forEach(value => {
      if (value !== 'all') {
        this.CheckSpecificBoxes(value, true);
      }
    });
    
  
    this.selectedTags = selectedItems;
  }
  

  OnCheckAllBoxes(setTo: boolean = true) {
    console.log(setTo ? "Checking all boxes" : "Unchecking all boxes");
    this.data.forEach(dataPoint => {
      dataPoint.selected = setTo;
    });
  }



  CheckSpecificBoxes(dataType: string, setTo: boolean = true){
    console.log("This is datatype: ", dataType);
    this.data.forEach(dataPoint => {
      if (dataPoint.type != null) {
        if ( dataPoint.type.toLowerCase() === dataType.toLowerCase() ){
          dataPoint.selected = setTo;
        }
      }
    });

    
  }

  /* This is for the rest of "All" that didnt work. Saving it for later though
    selectAllTags() {
    this.selectedTags = this.multipleSelectionService.selectAllFor('tags');
  }
  
  deselectAllTags() {
    this.selectedTags = []; // Unselects all in component
  } */


  async addTask(){
    const taskID = await this.supabaseService.createTask(this.caseId.toString());
    
    const taskAttributes = await this.supabaseService.loadCaseCustomTasks(this.caseId.toString());
    taskAttributes.forEach(element => {
      console.log("This is element: ", element);
      
      this.supabaseService.addTaskAttribute(taskID.id, element)
    });
    this.router.navigate(['/case', this.caseId, 'task', taskID.id]);
  }

  async refreshPage(): Promise<void> {
    window.location.reload();
  }
}
