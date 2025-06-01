import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExploreContainerComponentModule } from '../../explore-container/explore-container.module';
import { TaskPageRoutingModule } from './TaskPageRouting.module';
import { TaskPage } from './TaskPage.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    TaskPageRoutingModule,
    TaskPage 
  ]
})
export class TaskPageModule {}