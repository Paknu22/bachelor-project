import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ManageEmployeesPage } from './ManageEmployees.page';
import { ExploreContainerComponentModule } from '../../explore-container/explore-container.module';
import { ManageEmployeesPageRoutingModule } from './ManageEmployeesRouting.module';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    ManageEmployeesPageRoutingModule,
    ManageEmployeesPage
  ]
})
export class ManageEmployeesPageModule {}
