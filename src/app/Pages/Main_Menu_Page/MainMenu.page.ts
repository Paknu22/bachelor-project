import { Component, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BurgerMenuComponent } from 'src/app/Components/burger-menu/burger-menu.component';
import { UserSessionService } from 'src/app/UserSessionService';
import { SupabaseService } from 'src/app/supabase.service';
import { ModalService } from 'src/app/Services/Modal/modal.service';
import { Roles } from 'src/app/Enums/roles.enum';
import { PullToRefreshComponent } from 'src/app/Components/pull-to-refresh/pull-to-refresh.component';
import { Subscription } from 'rxjs';
import { StatusBar } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-main-menu',
  templateUrl: './MainMenu.page.html',
  styleUrls: ['./MainMenu.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, BurgerMenuComponent, PullToRefreshComponent]
})
export class MainMenuPage implements OnInit {
  cases: any[] = [];
  user: any;
  userName: string = 'User';
  isSuperUser: boolean = false; //Flag, starts as false
  

  //Used for search bar
  searchQuery: string = ''; 
  filteredCases: any[] = []; 

  //Subscription for listening to user change
  private userSubscription!: Subscription;

  constructor(


      private modalController: ModalController, 
      private router: Router,
      private userSessionService: UserSessionService,
      private modalService: ModalService,
      private supabaseService: SupabaseService,
      private platform: Platform,) 
      {
        this.user = this.userSessionService.getUser();
        this.userName = this.user.name;
        this.isSuperUser = this.userSessionService.isSuperUser();
        this.platform.ready().then(() => {
        StatusBar.setOverlaysWebView({ overlay: false });
        StatusBar.setBackgroundColor({ color: '#0961f9' });
        });
      /*
      Debugging log 
      console.log('Logged-in user:', this.user);
      console.log('Is super user:', this.isSuperUser); 
      */
      }

      async ngOnInit() {

        //Used for user changes 
        this.userSubscription = this.userSessionService.user$.subscribe(async (updatedUser) => {
      if (updatedUser) {
        console.log('User updated:', updatedUser);
        this.user = updatedUser;
        this.userName = updatedUser.name;
        this.isSuperUser = this.userSessionService.isSuperUser();
        await this.loadCases(); // Reload cases at user changes
      }
    });

        const freshUser = await this.supabaseService.getUserDetails();
        this.userSessionService.setUser(freshUser); //Updates local storeage with the latest user data
        this.user = freshUser;
        this.userName = this.user.name;
        this.isSuperUser = this.userSessionService.isSuperUser();

        this.cases = [];
        //Used by search bar
        await this.loadCases();
        this.filteredCases = this.cases;
      }


      //Changed loadcases to help with search bar
      async loadCases() {
        try {
          const user = await this.supabaseService.getUserDetails();
          // Logging user details for debugging
          // console.log('User details:', user);

          const isSuperUser = this.userSessionService.hasRole(Roles.SuperUser);
        
          if (user && user.company_id && isSuperUser) {
            // Logging company details if need for debug
            // console.log('Fetching cases for company:', user.company); 
            this.cases = await this.supabaseService.getCasesByCompany(user.company_id);
            // Case load debug
            // console.log('Cases loaded:', this.cases); 
          } else if (user && !isSuperUser) {
            this.cases = await this.supabaseService.getAllowedCases(user.id)
            
          } else {
            console.warn('User does not have a company assigned.');
          }

          this.filteredCases = this.cases;

        } catch (error) {
          console.error('Error loading cases:', error);
        } 
      }

      onSearchChange(event: any) {
        const query = event.target.value.toLowerCase();
        this.filteredCases = this.cases.filter(caseItem =>
          caseItem.title.toLowerCase().includes(query)
        );
      }


      get menuItems() {
        //Changed so we can separate manage employees and add case role acces
        const isSuperUser = this.userSessionService.hasRole(Roles.SuperUser);
        const canAddCase = this.userSessionService.hasAnyRole(Roles.SuperUser, Roles.ProjectManager);




        return [
          //Change to elevatedAcces so more roles can be elevated at once
          ...(canAddCase
            ? [{ icon: 'document', label: 'Add Case', action: () => this.openAddCaseModal() }]
            : []),
          ...(isSuperUser
            ? [{ icon: 'people', label: 'Manage Employees', action: () => this.navTo('/manage-employees') }]
            : []),
          { icon: 'person-circle', label: 'Account', action: () => this.navTo('account') },
          { icon: 'log-out', label: 'Logout', action: () => this.logout() },
        ];
      }

  logout() {
    console.log('Logging out...');
    this.userSessionService.clearUser(); 
    this.router.navigate(['/login']); 
  }
  addEmployeeBtn = { label: 'Add to Company', action: () => this.saveEmployeeToCompany()};
  
  navTo(route: string) {
    this.router.navigate([route]);
  }

  saveEmployeeToCompany(){
    console.log("Adding employee to company");
  }

  goToCase(caseId: number){
    this.router.navigate(['/case', caseId])
  }

  openCaseOptions(caseItem: any, event: Event) {
   event.stopPropagation();
  this.modalService.openEditRemoveCaseModal(caseItem, {
    onEdit: async (updatedCase: any) => {
      try {
        
        const { error } = await this.supabaseService.updateCase(caseItem.id, { title: updatedCase.title });
        if (error) {
          console.error('Error updating case in Supabase:', error);
          return;
        }

        
        const index = this.cases.findIndex(c => c.id === updatedCase.id);
        if (index !== -1) {
          this.cases[index].title = updatedCase.title;
          this.filteredCases = [...this.cases];
        }
      } catch (err) {
        console.error('Error during case update:', err);
      }
    },
    onRemove: async (caseId: number) => {
      try {
        
        const { error } = await this.supabaseService.deleteCase(caseId);
        if (error) {
          console.error('Error deleting case in Supabase:', error);
          return;
        }

        
        this.cases = this.cases.filter(c => c.id !== caseId);
        this.filteredCases = [...this.cases];
      } catch (err) {
        console.error('Error during case removal:', err);
      }
    }
  });
}
  openAddEmployeeModal(){
    this.modalService.openAddEmployeeModal(this.addEmployeeBtn);
  }

  openAddCaseModal(){
    if (this.isSuperUser) {
      this.modalService.openAddCaseModal();
    } else {
      console.log('Access denied: Only Super users can add cases.');
    }
  }

  //For refresh
  async refreshPage(): Promise<void> {
    window.location.reload();
  }

  //For user subscription
  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  //For hiding case options for workers
  get canShowCaseOptions(): boolean {
  return !this.userSessionService.hasRole(Roles.Worker);
}


}