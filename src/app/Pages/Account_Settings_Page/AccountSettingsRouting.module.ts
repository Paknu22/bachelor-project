import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountSettingsPage } from './AccountSettings.page';

const routes: Routes = [
  {
    path: '',
    component: AccountSettingsPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountSettingsPageRoutingModule {}