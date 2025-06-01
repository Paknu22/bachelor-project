import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from '../../supabase.service';
import { UserSessionService } from '../../UserSessionService';


@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  constructor(
    private supabaseService: SupabaseService,
    private userSessionService: UserSessionService
  ) {}

  async getEmployees(): Promise<{ name: string; email: string; role: string }[]> {
    try {
      const user = await this.supabaseService.getUserDetails();
      if (!user || !user.company_id) {
        throw new Error('User is not logged in or does not belong to a company.');
      }
  
      const employees = await this.supabaseService.getUsersByCompany(user.company_id);
      console.log('Employees:', employees);
  
      return employees.map((employee) => ({
        name: employee.name || 'Unknown',
        email: employee.email || 'Unknown',
        role: employee.role || 'Unknown',
      }));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async unassignEmployee(email: string): Promise<void> {
    try {
      console.log('Unassigning employee with email:', email);
      const result = await this.supabaseService.unassignUserFromCompany(email);
      console.log('Unassign result:', result);
    } catch (error) {
      console.error('Failed to unassign user from company:', error);
      throw error;
    }
  }

  //For modal to edit/remove employee
  async updateRole(email: string, role: string): Promise<void> {
    try {
      await this.supabaseService.updateUserRole(email, role);
    } catch (error) {
      console.error('Failed to update role:', error);
      throw error;
    }
  }

  
  


}