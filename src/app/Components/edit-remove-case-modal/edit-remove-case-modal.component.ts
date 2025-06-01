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
  selector: 'app-edit-remove-case-modal',
  templateUrl: './edit-remove-case-modal.component.html',
  styleUrls: ['./edit-remove-case-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, FileDisplayComponent]
})
export class EditRemoveCaseModalComponent {

  @Input() caseItem: any = {};
  @Input() onEdit: (updatedCase: any) => void = () => {};
  @Input() onRemove: (caseId: number) => void = () => {};
  @ViewChild('caseTitleInput', { static: false }) caseTitleInput!: IonInput;

  public caseTitle: string = "";

  images: LocalFile[] = [];
  private imagesSub?: Subscription;

  constructor(
    private modalController: ModalController,
    private typeaheadModal: TypeaheadModalService,
    private filePickerService: FilePickerService,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    this.caseTitle = this.caseItem.title || '';
    this.imagesSub = this.filePickerService.images$.subscribe(images => {
      this.images = images;
    });
    this.filePickerService.loadFiles();
    await this.loadEmployeesInCompany();
    await this.loadCaseFilesAndEmployees();
  }


  AddBluePrint() {
    this.filePickerService.selectFile();
  }

  async dismiss() {
    this.images.pop();
    await this.filePickerService.clearSessionFiles();
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
    console.log('Current value:', JSON.stringify(target.value));
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

    this.employees = rawEmployees.map(user => ({
      value: user.id,
      text: user.name || user.email || 'Unnamed User',
    }));
  }
  
  private async loadCaseFilesAndEmployees() {
    if (!this.caseItem?.id) return;


    try {
      const files = await this.supabaseService.RetrieveCaseFiles(this.caseItem.id);

      const localFiles: LocalFile[] = files.map(f => ({
        name: f.name,
        data: f.url,
        path: f.path,
      }));

      this.filePickerService.setInitialFiles(localFiles);
      
    } catch (error) {
      console.error('Error loading case files:', error);
    }

    try {
      const employees = await this.supabaseService.getEmployeesByCase(this.caseItem.id);

      const selectedIds = employees.map(emp =>
        this.employees.find(e => e.text === emp.name || e.text === emp.email)?.value
      ).filter(Boolean) as string[];



      this.selectedEmployees = selectedIds;
      this.selectedEmployeesText = this.typeaheadModal.formatSelectedItems(
        selectedIds,
        this.employees,
        { labelFallback: 'Employees' }
      );
    } catch (error) {
      console.error('Error loading assigned employees:', error);
    }
  }


  async SaveEditsToDatabase() {
    const updatedCase = {
      title: this.caseTitle,
    };

    try {
      const { error } = await this.supabaseService.updateCase(this.caseItem.id, updatedCase);
      if (error) {
        console.error('Error saving case updates:', error);
        return;
      }

      const sessionFileNames = this.filePickerService.getSessionFileNames();
      const newFiles = this.images.filter(file => sessionFileNames.includes(file.name));

      if (newFiles.length > 0) {
        await this.supabaseService.UploadCaseFiles(this.caseItem.id, newFiles);
     }

      await this.supabaseService.updateCaseEmployees(this.caseItem.id, this.selectedEmployees);

      this.onEdit({ ...this.caseItem, ...updatedCase });
      this.dismiss();
    } catch (err) {
      console.error('Save failed:', err);
    }
  }



  DeleteCaseFromDatabase(){
    this.onRemove(this.caseItem.id);
    this.dismiss();    
  }
  
  
}
