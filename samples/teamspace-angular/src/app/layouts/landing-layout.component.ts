import {Component} from '@angular/core';
import {HeaderComponent} from '../components/header.component';

@Component({
  selector: 'app-landing-layout',
  standalone: true,
  imports: [HeaderComponent],
  template: `
    <div class="min-h-screen bg-white">
      <app-header />
      <ng-content />
    </div>
  `,
})
export class LandingLayoutComponent {}
