import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoggedInGuard } from './guards/logged-in.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./Pages/Login_Page/Login.module').then(m => m.LoginPageModule) },
  { path: 'main-menu', loadChildren: () => import('./Pages/Main_Menu_Page/MainMenu.module').then(m => m.MainMenuPageModule) },
  {
    path: 'case/:id',
    loadComponent: () => import('./Pages/Case_Page/CasePage.page').then(m => m.CasePage),
    canActivate: [LoggedInGuard]
  },
  { path: 'case/:caseId/task/:taskId', 
    loadChildren: () => import('./Pages/Task_Page/TaskPage.module').then(m => m.TaskPageModule), 
    canActivate: [LoggedInGuard]
  },


  { path: 'account', loadChildren: () => import('./Pages/Account_Page/Account.module').then(m => m.AccountPageModule) },
  { path: 'account-settings', loadChildren: () => import('./Pages/Account_Settings_Page/AccountSettings.module').then(m => m.AccountSettingsPageModule) },
  { path: 'create-account', loadChildren: () => import('./Pages/Create_Account_Page/CreateAccount.module').then(m => m.CreateAccountPageModule) },
  { path: 'forgot-password', loadChildren: () => import('./Pages/Forgot_Password_Page/ForgotPassword.module').then(m => m.ForgotPasswordPageModule) },
  { path: 'manage-employees', loadChildren: () => import('./Pages/Manage_Employees_Page/ManageEmployees.module').then(m => m.ManageEmployeesPageModule),
    canActivate: [AuthGuard] },
  { path: 'create-account', loadChildren: () => import('./Pages/Create_Account_Page/CreateAccount.module').then( (m) => m.CreateAccountPageModule),},
  { path: 'reset-password', loadComponent: () => import('./Pages/Reset_Password_Page/reset-password/reset-password.page').then(m => m.ResetPasswordPage) },
  
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}