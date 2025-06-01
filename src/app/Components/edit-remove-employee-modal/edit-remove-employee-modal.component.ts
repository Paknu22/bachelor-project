import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Roles } from 'src/app/Enums/roles.enum';
import { EmployeeService } from 'src/app/Pages/Manage_Employees_Page/employee.service';

@Component({
  selector: 'app-edit-remove-employee-modal',
  templateUrl: './edit-remove-employee-modal.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EditRemoveEmployeeModalComponent {
  @Input() employee: { name: string; email: string; role: string } = { name: '', email: '', role: '' };
  @Input() onRemove: (email: string) => void = () => {};
  @Input() onUpdateRole: (email: string, role: string) => void = () => {};

  roleKeys = Object.keys(Roles) as (keyof typeof Roles)[];
  Roles = Roles;

  constructor(
    private modalController: ModalController,
    private employeeService: EmployeeService
  ) {}

  dismiss() {
    this.modalController.dismiss();
  }

  async removeEmployee() {
    try {
      console.log('Attempting to remove employee:', this.employee.email);
      await this.employeeService.unassignEmployee(this.employee.email);
      alert(`Employee ${this.employee.name} removed successfully.`);
      this.dismiss();
    } catch (error) {
      console.error('Error removing employee:', error);
      alert('Failed to remove employee. Please try again.');
    }
  }

  updateRole() {
    this.onUpdateRole(this.employee.email, this.employee.role);
    this.dismiss();
  }
}