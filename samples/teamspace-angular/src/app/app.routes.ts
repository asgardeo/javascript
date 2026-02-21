import {Routes} from '@angular/router';
import {authGuard} from './guards/auth.guard';

export const routes: Routes = [
  {path: '', loadComponent: () => import('./pages/landing.component').then(m => m.LandingComponent)},
  {path: 'callback', loadComponent: () => import('./pages/callback.component').then(m => m.CallbackPageComponent)},
  {path: 'dashboard', loadComponent: () => import('./pages/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard]},
  {path: 'profile', loadComponent: () => import('./pages/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard]},
  {path: 'organizations', loadComponent: () => import('./pages/organizations.component').then(m => m.OrganizationsComponent), canActivate: [authGuard]},
  {path: 'organizations/new', loadComponent: () => import('./pages/create-org.component').then(m => m.CreateOrgComponent), canActivate: [authGuard]},
  {path: 'debug', loadComponent: () => import('./pages/debug.component').then(m => m.DebugComponent), canActivate: [authGuard]},
  {path: '**', redirectTo: ''},
];
