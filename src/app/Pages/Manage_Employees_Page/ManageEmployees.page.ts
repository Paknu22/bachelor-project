import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EmployeeService } from './employee.service';
import { Router } from '@angular/router';
import { EditRemoveEmployeeModalComponent } from 'src/app/Components/edit-remove-employee-modal/edit-remove-employee-modal.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'Manage-Employees-Page',
  templateUrl: 'ManageEmployees.page.html',
  styleUrls: ['ManageEmployees.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ManageEmployeesPage implements OnInit {
  employees: { name: string; email: string; role: string }[] = [];

  // Used for filtering employees 
  filteredEmployees: { name: string; email: string; role: string }[] = [];
  searchQuery: string = '';


  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private modalController: ModalController
  ) {}

  //For modal to edit/remove employee
  async openEditRemoveModal(employee: { name: string; email: string; role: string }) {
    const modal = await this.modalController.create({
      component: EditRemoveEmployeeModalComponent,
      componentProps: {
        employee,
        onRemove: async (email: string) => {
          await this.unassignEmployee(email);
        },
        onUpdateRole: async (email: string, role: string) => {
          await this.updateEmployeeRole(email, role);
        }
      }
    });
    await modal.present();
  }

  
  async updateEmployeeRole(email: string, role: string) {
    try {
      await this.employeeService.updateRole(email, role);
      this.employees = await this.employeeService.getEmployees();
      this.filteredEmployees = this.employees;
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role.');
    }
  }

  
  async ngOnInit() {
    try {
      this.employees = await this.employeeService.getEmployees();
      this.filteredEmployees = this.employees;
      console.log('Employees:', this.employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }

  // Filter employees method
  onSearchChange(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredEmployees = this.employees.filter(employee =>
      employee.name.toLowerCase().includes(query) ||
      employee.email.toLowerCase().includes(query) ||
      employee.role.toLowerCase().includes(query)
    );
  }

  goBack(){
    this.router.navigate(['/main-menu'])
  }

  async unassignEmployee(email: string) {
    const confirmed = confirm(`Unassign ${email} from company?`);
    if (!confirmed) return;
  
    try {
      await this.employeeService.unassignEmployee(email);
      
      this.employees = await this.employeeService.getEmployees();
    } catch (error) {
      console.error('Error unassigning employee:', error);
      alert('Failed to unassign employee.');
    }
  }
  
}