import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageEmployeesPage } from './ManageEmployees.page';

const routes: Routes = [
  {
    path: '',
    component: ManageEmployeesPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageEmployeesPageRoutingModule {}
