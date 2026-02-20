import {Component} from '@angular/core';
import {HeaderComponent} from '../components/header.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [HeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header />
      <main>
        <ng-content />
      </main>
    </div>
  `,
})
export class DashboardLayoutComponent {}
