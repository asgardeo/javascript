import {Component, computed, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {AsgardeoAuthService} from '@asgardeo/angular';
import {HeaderComponent} from '../components/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, HeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header />

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Welcome Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">
            Welcome back {{ userFullName() }}!
          </h1>
          @if (authService.currentOrganization(); as org) {
            <p class="text-gray-600 mt-2">
              Here's what's happening with
              <span class="font-medium">{{ org.orgHandle ? '@' + org.orgHandle : org.name || org.id }}</span>
              today.
            </p>
          }
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          @for (stat of stats; track stat.name) {
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">{{ stat.name }}</p>
                  <p class="text-3xl font-bold text-gray-900 mt-2">{{ stat.value }}</p>
                </div>
                <div class="p-3 bg-blue-50 rounded-lg">
                  <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="stat.iconPath" />
                  </svg>
                </div>
              </div>
              <div class="mt-4 flex items-center">
                <svg [class]="stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'" class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span [class]="stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium">
                  {{ stat.change }}
                </span>
                <span class="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          }
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Recent Activity -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                @for (activity of recentActivity; track activity.id) {
                  <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                      <div [class]="activity.bgClass" class="w-8 h-8 rounded-full flex items-center justify-center">
                        <svg [class]="activity.iconClass" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="activity.iconPath" />
                        </svg>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-gray-900">
                        <span class="font-medium">{{ activity.user }}</span> {{ activity.action }}
                      </p>
                      <p class="text-xs text-gray-500 mt-1">{{ activity.time }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Upcoming Tasks -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                @for (task of upcomingTasks; track task.id) {
                  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div class="flex-1">
                      <h3 class="text-sm font-medium text-gray-900">{{ task.title }}</h3>
                      <p class="text-xs text-gray-500 mt-1">{{ task.project }}</p>
                    </div>
                    <div class="flex items-center space-x-3">
                      <div class="flex items-center text-xs text-gray-500">
                        <svg class="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ task.dueDate }}
                      </div>
                      <span
                        [class]="task.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'"
                        class="px-2 py-1 rounded-full text-xs font-medium"
                      >
                        @if (task.priority === 'high') {
                          <svg class="h-3 w-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        }
                        {{ task.priority }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  authService = inject(AsgardeoAuthService);

  stats = [
    {
      name: 'Active Projects',
      value: '12',
      change: '+2.1%',
      changeType: 'positive',
      iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      name: 'Team Members',
      value: '0',
      change: '+5.4%',
      changeType: 'positive',
      iconPath: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    },
    {
      name: 'Messages Today',
      value: '89',
      change: '+12.5%',
      changeType: 'positive',
      iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    },
    {
      name: 'Meetings This Week',
      value: '7',
      change: '-2.3%',
      changeType: 'negative',
      iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
  ];

  recentActivity = [
    {
      id: 1,
      user: 'Sarah Chen',
      action: 'completed task "Design Review"',
      time: '2 hours ago',
      bgClass: 'bg-green-100',
      iconClass: 'text-green-600',
      iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      id: 2,
      user: 'Mike Johnson',
      action: 'created new project "Mobile App"',
      time: '4 hours ago',
      bgClass: 'bg-blue-100',
      iconClass: 'text-blue-600',
      iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      id: 3,
      user: 'Emily Davis',
      action: 'scheduled team meeting',
      time: '6 hours ago',
      bgClass: 'bg-purple-100',
      iconClass: 'text-purple-600',
      iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
      id: 4,
      user: 'Alex Rodriguez',
      action: 'uploaded 3 files to "Q4 Planning"',
      time: '1 day ago',
      bgClass: 'bg-orange-100',
      iconClass: 'text-orange-600',
      iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
  ];

  upcomingTasks = [
    {id: 1, title: 'Review quarterly reports', dueDate: 'Today, 3:00 PM', priority: 'high', project: 'Q4 Planning'},
    {id: 2, title: 'Team standup meeting', dueDate: 'Tomorrow, 9:00 AM', priority: 'medium', project: 'Daily Operations'},
    {id: 3, title: 'Client presentation prep', dueDate: 'Friday, 2:00 PM', priority: 'high', project: 'Client Work'},
  ];

  userFullName = computed(() => {
    const user = this.authService.user();
    if (!user) return '';
    const givenName = (user as any)['givenName'] || (user as any)['name']?.['givenName'] || (user as any)['given_name'] || '';
    const familyName = (user as any)['name']?.['familyName'] || (user as any)['familyName'] || (user as any)['family_name'] || '';
    return [givenName, familyName].filter(Boolean).join(' ');
  });
}
