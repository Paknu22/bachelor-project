import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResetPasswordPage } from './reset-password.page';

const routes: Routes = [
  {
    path: '',
    component: ResetPasswordPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class ResetPasswordPageModule {}
