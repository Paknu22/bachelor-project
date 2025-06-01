import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from 'src/app/supabase.service';

@Component({
  selector: 'app-add-employee-to-case-modal',
  templateUrl: './add-employee-to-case-modal.component.html',
  styleUrls: ['./add-employee-to-case-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule], 
})
export class AddEmployeeToCaseModalComponent {
  @Input() caseId!: number;
  companyEmployees: { name: string; email: string; role: string }[] = [];
  caseEmployees: { email: string }[] = [];

  constructor(
    private modalController: ModalController,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    await this.loadCompanyEmployees();
    await this.loadCaseEmployees();
  }

  async loadCompanyEmployees() {
    try {
      const userDetails = await this.supabaseService.getUserDetails();
      const companyId = userDetails?.company_id;
  
      if (!companyId) {
        throw new Error('User does not belong to a company.');
      }
  
      const employees = await this.supabaseService.getCompanyEmployees(companyId);
      this.companyEmployees = employees.map((employee: { name: string; email: string; role: string }) => ({
        name: employee.name || 'Unknown',
        email: employee.email || 'Unknown',
        role: employee.role || 'Unknown',
      }));
    } catch (error) {
      console.error('Error loading company employees:', error);
    }
  }

  async loadCaseEmployees() {
    try {
      const employees = await this.supabaseService.getEmployeesByCase(this.caseId);
      this.caseEmployees = employees.map((employee: { email: string }) => ({
        email: employee.email,
      }));
    } catch (error) {
      console.error('Error loading case employees:', error);
    }
  }

  isEmployeeInCase(email: string): boolean {
    return this.caseEmployees.some((employee) => employee.email === email);
  }

  async addEmployeeToCase(email: string) {
    try {
      
      const user = await this.supabaseService.getUserByEmail(email);
      if (!user || !user.id) {
        throw new Error(`User with email ${email} not found.`);
      }
  
      
      await this.supabaseService.addUserToCase(this.caseId.toString(), user.id);
      await this.loadCaseEmployees(); 
      alert(`Employee ${email} added to case successfully.`);
    } catch (error) {
      console.error('Error adding employee to case:', error);
      alert('Failed to add employee to case.');
    }
  }



  dismiss() {
    this.modalController.dismiss();
  }

  
}