import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IonAccordion, IonAccordionGroup, IonItem, IonLabel } from '@ionic/angular/standalone';
import { AccordionItem } from 'src/app/Interfaces/accordion';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  standalone: true,
  imports: [IonAccordion, IonAccordionGroup, IonItem, IonLabel, CommonModule],
})
export class AccordionComponent  implements OnInit {
  @Input() accordionTitle: string;
  @Input() data: AccordionItem[] = [];

  @Output() itemClicked = new EventEmitter<any>();

  constructor() {
    this.accordionTitle = "";
   }

  ngOnInit() {}

  handleClick(item: any) {
    this.itemClicked.emit(item);
  }

}