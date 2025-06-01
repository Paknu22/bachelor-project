import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/supabase.service';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PullToRefreshComponent } from 'src/app/Components/pull-to-refresh/pull-to-refresh.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  templateUrl: './reset-password.page.html',
  imports: [IonicModule, FormsModule, PullToRefreshComponent],
})
export class ResetPasswordPage implements OnInit {
  newPassword: string = '';

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    const { data, error } = await this.supabaseService.getCurrentSession();
    if (error || !data.session?.user) {
      this.router.navigate(['/login']);
    }
  }

  async updatePassword() {
    if (!this.newPassword || this.newPassword.length < 6) return;

    const { error } = await this.supabaseService.updatePassword(this.newPassword);
    if (!error) this.router.navigate(['/login']);
  }

  async refreshPage(): Promise<void> {
    window.location.reload();
  }
}
