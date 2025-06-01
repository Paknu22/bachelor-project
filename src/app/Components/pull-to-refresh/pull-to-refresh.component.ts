import { Component, Input } from '@angular/core';
import { IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-pull-to-refresh',
  templateUrl: './pull-to-refresh.component.html',
  standalone: true,
  imports: [IonRefresher, IonRefresherContent],
})
export class PullToRefreshComponent {
  @Input() refreshFn!: () => Promise<void>;

  async onRefresh(event: CustomEvent) {
    try {
      if (this.refreshFn) {
        await this.refreshFn();
      } else {
        console.warn('No refreshFn provided');
      }
    } catch (err) {
      console.error('Error during refresh:', err);
    } finally {
      (event.target as HTMLIonRefresherElement).complete();
    }
  }
}
