import {Routes} from '@angular/router';
import {LandingComponent} from './pages/landing.component';
import {CallbackPageComponent} from './pages/callback.component';
import {DashboardComponent} from './pages/dashboard.component';
import {ProfileComponent} from './pages/profile.component';
import {OrganizationsComponent} from './pages/organizations.component';
import {CreateOrgComponent} from './pages/create-org.component';
import {DebugComponent} from './pages/debug.component';
import {authGuard} from './guards/auth.guard';

export const routes: Routes = [
  {path: '', component: LandingComponent},
  {path: 'callback', component: CallbackPageComponent},
  {path: 'dashboard', component: DashboardComponent, canActivate: [authGuard]},
  {path: 'profile', component: ProfileComponent, canActivate: [authGuard]},
  {path: 'organizations', component: OrganizationsComponent, canActivate: [authGuard]},
  {path: 'organizations/new', component: CreateOrgComponent, canActivate: [authGuard]},
  {path: 'debug', component: DebugComponent, canActivate: [authGuard]},
  {path: '**', redirectTo: ''},
];
