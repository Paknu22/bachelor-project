import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'Account-Settings-Page',
  templateUrl: 'AccountSettings.page.html',
  styleUrls: ['AccountSettings.page.scss'],
  standalone: false,
})
export class AccountSettingsPage {
  email: string = "Admin.admin@gmail.com";
  newEmail: string = "";

  constructor(private navCtrl: NavController) {}

  goToCase() {
    this.navCtrl.back();
  }

  saveChanges() {
    console.log('Save changes');
  }

  changeSubscription() {
    console.log('Change subscription');
  }

  logout() {
    console.log('Log out');
  }
}