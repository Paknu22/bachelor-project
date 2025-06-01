import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges, OnChanges, ViewChild } from '@angular/core';
import { MultipleSelectionsService } from 'src/app/Services/Multiple-Selections/multiple-selections.service';
import { Item } from 'src/app/Interfaces/types';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-multiple-selection',
  templateUrl: './multiple-selection.component.html',
  styleUrls: ['./multiple-selection.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
  ]
})
export class MultipleSelectionComponent implements OnInit, OnChanges {
  @ViewChild('selectRef', { static: false }) selectRef: any;
  
  @Input() selectionKey: string = ''; // required to fetch the correct list
  @Input() selected: Item[] = [];
  @Output() selectionChanged = new EventEmitter<Item[]>();

  items: Item[] = [];


  constructor(private service: MultipleSelectionsService) {}

  ngOnInit(): void {
    this.items = this.service.getItemsFor(this.selectionKey);
  }

  handleChange(event: CustomEvent) {
    this.selected = event.detail.value;
    console.log(`Selected in [${this.selectionKey}]`, this.selected);
    this.selectionChanged.emit(this.selected);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selected']) {
      this.selected = [...this.selected]; // trigger change detection
    }
  }

  compareWith = (o1: Item, o2: Item): boolean => o1?.value === o2?.value;
}
