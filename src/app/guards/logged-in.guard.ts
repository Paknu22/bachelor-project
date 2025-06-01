import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserSessionService } from '../UserSessionService';
import { SupabaseService } from '../supabase.service';

@Injectable({
  providedIn: 'root',
})
export class LoggedInGuard implements CanActivate {
  constructor(private userSessionService: UserSessionService, private router: Router, private supabaseService: SupabaseService) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const user = this.userSessionService.getUser();
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check if user has acces to both case and task
    const caseId = route.paramMap.get('id') || route.paramMap.get('caseId');
    if (caseId) {
      try {
        const caseData = await this.supabaseService.getCasesByCompany(user.company_id);
        const allowed = caseData.some((c: any) => String(c.id) === String(caseId));
        if (!allowed) {
          this.router.navigate(['/main-menu']);
          return false;
        }
      } catch (error) {
        this.router.navigate(['/main-menu']);
        return false;
      }
    }

    return true;
  }
}