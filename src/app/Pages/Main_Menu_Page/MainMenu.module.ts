import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainMenuPage } from './MainMenu.page';
import { ExploreContainerComponentModule } from '../../explore-container/explore-container.module';

import { MainMenuPageRoutingModule } from './MainRouting.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    MainMenuPageRoutingModule
  ],

})
export class MainMenuPageModule {}
