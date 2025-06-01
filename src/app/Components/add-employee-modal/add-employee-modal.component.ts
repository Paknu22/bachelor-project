import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from 'src/app/supabase.service';
import { UserSessionService } from 'src/app/UserSessionService';
import { Roles } from 'src/app/Enums/roles.enum';
@Component({
  selector: 'app-add-employee-modal',
  templateUrl: './add-employee-modal.component.html',
  styleUrls: ['./add-employee-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AddEmployeeModalComponent {
  
  @Input() addEmployeeBtn: { label: string, action: () => void } = { label: '', action: () => {} };

  name = '';
  email = '';

  // Set a default value from the Roles enum
  role: Roles = Roles.Worker;
  Roles = Roles;

  //Used for html
  roleKeys = Object.keys(Roles) as (keyof typeof Roles)[]; 

  constructor(
    private modalController: ModalController,
    private supabase: SupabaseService,
    private userSession: UserSessionService
  ) {}

  dismiss() {
    this.modalController.dismiss();
  }

  async addEmployee() {
    if (!this.name || !this.email) return;
  
    const currentUser = this.userSession.getUser();
    const companyId = currentUser?.company_id;

    //Remove line later need to check session
    /*
    const session = await this.supabase.getCurrentSession();
    console.log('Session:', session);
    */
  
    try {
      await this.supabase.assignUserToCompany(this.email, this.role, companyId);
      console.log('User assigned to company with role.');
      this.addEmployeeBtn.action();
      this.dismiss();
    } catch (error) {
      console.error('Failed to assign user:', error);
      
    }
  }
}