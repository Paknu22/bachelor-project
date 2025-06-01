import { Injectable } from '@angular/core';
import { Roles } from 'src/app/Enums/roles.enum';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserSessionService {
  private userData: any = null;

  //Used for dynamic update
  private userSubject = new BehaviorSubject<any>(null);
   user$ = this.userSubject.asObservable(); 

  setUser(data: any) {
    this.userData = data;
    localStorage.setItem('userData', JSON.stringify(data));
    this.userSubject.next(data);
  }
  
  getUser() {
    if (!this.userData) {
      const storedData = localStorage.getItem('userData');
      this.userData = storedData ? JSON.parse(storedData) : null;
    }
    return this.userData;
  }
  
  clearUser() {
    this.userData = null;
    localStorage.removeItem('userData');
    this.userSubject.next(null);
  }

  isSuperUser(): boolean {
    const user = this.getUser();
    return user?.role === Roles.SuperUser;
  }

  //User roles
  getUserRole(): Roles | null {
    const user = this.getUser();
    return user?.role as Roles || null;
  }

  hasRole(role: Roles): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  //For checking more roles at once
  hasAnyRole(...roles: Roles[]): boolean {
    const userRole = this.getUserRole();
    return roles.includes(userRole as Roles);
  }
}