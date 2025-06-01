import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular'; // this brings in <ion-menu> and friends
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-burger-menu',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './burger-menu.component.html',
  styleUrls: ['./burger-menu.component.scss']
})
export class BurgerMenuComponent {
  @Input() menuId: string = 'custom';
  @Input() contentId: string = 'main-content';
  @Input() menuItems: { icon?: string, label: string, action: () => void }[] = [];
}
