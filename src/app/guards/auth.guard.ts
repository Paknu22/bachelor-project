import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserSessionService } from '../UserSessionService';
import { Roles } from '../Enums/roles.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private userSessionService: UserSessionService, private router: Router) {}

  canActivate(): boolean {
    const hasAccess = this.userSessionService.hasAnyRole(Roles.SuperUser);
    if (!hasAccess) {
      this.router.navigate(['/main-menu']); //Send user to main if roles are not Super
      return false;
    }
    return true;
  }
}