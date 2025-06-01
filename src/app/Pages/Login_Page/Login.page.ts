import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../supabase.service';
import { UserSessionService } from 'src/app/UserSessionService';
import { PullToRefreshComponent } from 'src/app/Components/pull-to-refresh/pull-to-refresh.component';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'Login-Page',
  templateUrl: 'Login.page.html',
  styleUrls: ['Login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PullToRefreshComponent]
})
export class LoginPage {
  email: string = "";
  password: string = "";
  loginError: string = '';

  companyData: any[] = []; 



  constructor(private router: Router, 
    private supabaseService: SupabaseService,
    private userSessionService: UserSessionService ) {}

  async fetchCompanyData() {
    try {
      const data = await this.supabaseService.getData('Company');
      this.companyData = data; // Store the fetched data
      console.log('Fetched Company Data:', this.companyData);
    } catch (error) {
      console.error('Error fetching Company data:', error);
    }
  }

  ngAfterViewInit() {
    this.initializeHCaptcha();
  }

  private initializeHCaptcha() {
    const hcaptchaContainer = document.getElementById('hcaptcha-container');
    if (hcaptchaContainer) {
      // Clear old instance
      hcaptchaContainer.replaceChildren();

  
      if ((window as any).hcaptcha) {
        (window as any).hcaptcha.render(hcaptchaContainer, {
          sitekey: '11b06818-f152-407e-95cc-d624ffc60fa0', 
        });
      } else {
        console.error('hCaptcha library not loaded.');
      }
    } else {
      console.error('hCaptcha container not found.');
    }
  }

  onLogin(){
    this.router.navigate(['/main-menu'])
  }

  goToForgotPassword(){
    this.router.navigate(['/forgot-password'])
  }

  goToCreateAccount(){
    this.router.navigate(['/create-account']);
  }

  
  async login() {
   this.loginError = '';
  try {
    
    const hcaptchaResponse = (window as any).hcaptcha.getResponse();
    if (!hcaptchaResponse) {
      alert('Please complete the hCaptcha.');
      return;
    }

    
    const { data, error } = await this.supabaseService.loginWithEmail(this.email, this.password, hcaptchaResponse);

    if (error) {
      console.error('Login error:', error.message);
      alert('Login failed. Please check your credentials.');
      (window as any).hcaptcha.reset(); // Resets hCaptcha widget
      return;
    }

    // Fetch user details and store 
    const userDetails = await this.supabaseService.getUserDetails();
    this.userSessionService.setUser(userDetails);
    console.log('Login successful:', userDetails);

    
    this.onLogin();

    // Reset hCaptcha 
    (window as any).hcaptcha.reset();
  } catch (error) {
    console.error('Unexpected error during login:', error);
    alert('Something went wrong. Try again.');
    (window as any).hcaptcha.reset();
  }
}
  

  
  async refreshPage(): Promise<void> {
    window.location.reload();
  }
  

}
