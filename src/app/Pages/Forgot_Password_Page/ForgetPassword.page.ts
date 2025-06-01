import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/supabase.service';
import { PullToRefreshComponent } from 'src/app/Components/pull-to-refresh/pull-to-refresh.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'Forgot-Password-Page',
  templateUrl: 'ForgotPassword.page.html',
  styleUrls: ['ForgotPassword.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, PullToRefreshComponent]
})
export class ForgotPasswordPage {
  email: string = "";

  constructor(private router: Router, private supabaseService: SupabaseService ) {}

  ngAfterViewInit() {
    this.initializeHCaptcha();
  }

  private initializeHCaptcha() {
  const hcaptchaContainer = document.getElementById('hcaptcha-container');
  if (hcaptchaContainer) {
    // Clear old instance
    hcaptchaContainer.innerHTML = '';

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

  goToLogin(){
    this.router.navigate(['/login'])
  }

  async sendRecoveryMail() {
  try {
    
    const hcaptchaResponse = (window as any).hcaptcha.getResponse();
    if (!hcaptchaResponse) {
      alert('Please complete the hCaptcha.');
      return;
    }

    
    const { error } = await this.supabaseService.resetPassword(this.email, hcaptchaResponse);

    if (error) {
      console.error('Error sending recovery email:', error.message);
      alert('Failed to send recovery email. Please try again.');
      (window as any).hcaptcha.reset(); // Resets hCaptcha widget
      return;
    }

    alert('Recovery email sent successfully! Please check your inbox.');
    this.router.navigate(['/login']);

    
    (window as any).hcaptcha.reset();
  } catch (error) {
    console.error('Unexpected error:', error);
    alert('Something went wrong. Please try again.');
    (window as any).hcaptcha.reset();
  }
}

  async refreshPage(): Promise<void> {
    window.location.reload();
  }
}
