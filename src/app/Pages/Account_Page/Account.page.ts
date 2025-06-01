import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../supabase.service';
import { Router } from '@angular/router';
import { UserSessionService } from 'src/app/UserSessionService';


@Component({
  selector: 'AccountPage',
  templateUrl: 'Account.page.html',
  styleUrls: ['Account.page.scss'],
  standalone: false,
})
export class AccountPage implements OnInit {
  user: any;
  userName: string = 'User';
  userEmail: string = 'Email';
  newEmail: string = '';
  newPassword: string = '';


  constructor(private supabaseService: SupabaseService, private router: Router,private userSessionService: UserSessionService) {
    this.user = this.userSessionService.getUser();
    this.userName = this.user.name
  console.log('Logged-in user:', this.user);

  }

  async ngOnInit() {
    try {
      this.user = await this.supabaseService.getUserDetails(); 
    } catch (error) {
      console.error('Error fetching user details:', error);

      
    }
  }

  async changeEmail() {
    if (!this.newEmail) {
      console.error('New email is required.');
      return;
    }

    try {
      const updatedUser = await this.supabaseService.updateUserEmail(this.user.id, this.newEmail);
      console.log('Email updated successfully:', updatedUser);
      this.user.email = this.newEmail; // Update local user object
      alert('Email updated successfully!');
      this.userSessionService.setUser(this.user); // Update user session
    } catch (error) {
      console.error('Error updating email:', error);
      alert('Failed to update email. Please try again.');
    }
  }

  async changePassword() {
    if (!this.newPassword) {
      console.error('New password is required.');
      return;
    }

    try {
      await this.supabaseService.updateUserPassword(this.user.id, this.newPassword);
      console.log('Password updated successfully!');
      alert('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password. Please try again.');
    }
  }

  goBack(){
    this.router.navigate(['/main-menu'])
  }

  //For user delete
  async deleteAccount() {
  const confirmed = confirm('Are you sure you want to delete your account? This cannot be undone.');
  if (!confirmed) return;

  try {
    await this.supabaseService.deleteCurrentUser();
    alert('Account deleted.');
    this.userSessionService.clearUser();
    this.router.navigate(['/login']);
  } catch (err: any) {
    alert('Failed to delete account: ' + (err.message || err));
  }
}
}