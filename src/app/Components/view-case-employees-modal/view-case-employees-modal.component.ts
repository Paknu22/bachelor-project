import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from 'src/app/supabase.service';

@Component({
  selector: 'app-view-case-employees-modal',
  templateUrl: './view-case-employees-modal.component.html',
  styleUrls: ['./view-case-employees-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ViewCaseEmployeesModalComponent {
  @Input() caseId!: number;
  employees: { name: string; email: string; role: string }[] = [];

  constructor(
    private modalController: ModalController,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    await this.loadEmployees();
  }

  async loadEmployees() {
    try {
      const employees = await this.supabaseService.getEmployeesByCase(this.caseId);
      this.employees = employees.map((employee: { name: string; email: string; role: string }) => ({
        name: employee.name || 'Unknown',
        email: employee.email || 'Unknown',
        role: employee.role || 'Unknown',
      }));
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  async removeEmployee(email: string) {
    try {
      await this.supabaseService.removeEmployeeFromCase(this.caseId, email);
      await this.loadEmployees();
    } catch (error) {
      console.error('Error removing employee:', error);
    }
  }
}
