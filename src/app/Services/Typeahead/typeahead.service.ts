import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TypeaheadComponent } from 'src/app/Components/typeahead/typeahead.component';
import { Item } from 'src/app/Interfaces/types';

@Injectable({
  providedIn: 'root',
})
export class TypeaheadModalService {
  constructor(private modalCtrl: ModalController) {}

  async open(options: {
    title: string;
    items: Item[];
    selectedItems?: string[];
  }): Promise<string[] | null> {
    const modal = await this.modalCtrl.create({
      component: TypeaheadComponent,
      componentProps: {
        title: options.title,
        items: options.items,
        selectedItems: options.selectedItems || [],
      },
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss<string[]>();
    return role === 'confirm' ? data ?? null : null;
  }


    /**
   * Formats selected item values into display text
   * @param selectedValues array of selected item values
   * @param allItems full list of items to resolve labels from
   * @returns readable display text like "Apple" or "3 items"
   */
    formatSelectedItems(
      selectedValues: string[],
      allItems: Item[],
      options?: { labelFallback?: string }
    ): string {
      const fallback = options?.labelFallback ?? 'items';
  
      if (selectedValues.length === 1) {
        const match = allItems.find(i => i.value === selectedValues[0]);
        return match ? match.text : selectedValues[0]; // fallback to value if no match
      }
  
      return `${selectedValues.length} ${fallback}`;
    }
}
