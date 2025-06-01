import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../supabase.service';
import { PullToRefreshComponent } from 'src/app/Components/pull-to-refresh/pull-to-refresh.component';



@Component({
  selector: 'Create-Account-Page',
  templateUrl: 'CreateAccount.page.html',
  styleUrls: ['CreateAccount.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PullToRefreshComponent]
})
export class CreateAccountPage {
  name: string = '';
  email: string = '';
  password: string = '';
  hcaptchaKey: string = '11b06818-f152-407e-95cc-d624ffc60fa0 '; 

  constructor(
    private router: Router, 
    private supabaseService: SupabaseService, 
  ) {}



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

  async createAccount() {
    try {
    // the hCaptcha response token
    const hcaptchaResponse = (window as any).hcaptcha.getResponse();
    if (!hcaptchaResponse) {
      alert('Please complete the hCaptcha.');
      return;
    }

    // create a new with hCaptcha token
    const result = await this.supabaseService.createUser(this.name, this.email, this.password, hcaptchaResponse);
    console.log('Account created in database:', result);

    alert('Account created successfully!');
    this.router.navigate(['/login']);

    //Reset fields
    this.name = '';
    this.email = '';
    this.password = '';
    


  } catch (error) {
    console.error('Error creating account:', error);
    alert('Failed to create account. Please try again.');
  }

  

  }

  async refreshPage(): Promise<void> {
    window.location.reload();
  }
  
}