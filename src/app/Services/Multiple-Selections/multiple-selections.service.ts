import { Injectable } from '@angular/core';
import { Item } from 'src/app/Interfaces/types';

@Injectable({
  providedIn: 'root',
})
export class MultipleSelectionsService {
  private itemMap = new Map<string, Item[]>();

  setItemsFor(key: string, items: Item[]) {
    this.itemMap.set(key, items);
  }

  getItemsFor(key: string): Item[] {
    return this.itemMap.get(key) || [];
  }

  private selectedItemMap = new Map<string, Item[]>();

  selectAllFor(key: string) {
    const all = this.getItemsFor(key);
    this.selectedItemMap.set(key, [...all]);
    return [...all];
  }
  
}