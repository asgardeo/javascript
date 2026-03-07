/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  InputSignal,
  OutputEmitterRef,
  Signal,
  WritableSignal,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {Organization} from '@asgardeo/browser';
import {AsgardeoOrganizationService} from '../../services/asgardeo-organization.service';
import {generateGradient, getInitials} from '../../utils/avatar';

/**
 * Angular Organization Switcher component matching the React SDK's `<OrganizationSwitcher />`.
 *
 * A trigger button with dropdown for switching between organizations.
 * Uses CSS absolute positioning (no floating-ui dependency).
 *
 * @example
 * ```html
 * <asgardeo-organization-switcher
 *   (organizationSwitch)="onSwitch($event)"
 * />
 *
 * <!-- With custom trigger label visibility -->
 * <asgardeo-organization-switcher
 *   [showTriggerLabel]="false"
 *   [avatarSize]="32"
 * />
 * ```
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'asgardeo-organization-switcher',
  standalone: true,
  styles: `
    :host {
      /* Core palette */
      --asgardeo-color-primary: #4f46e5;
      --asgardeo-color-primary-hover: #4338ca;

      /* Text */
      --asgardeo-color-text: #111827;
      --asgardeo-color-text-secondary: #6b7280;
      --asgardeo-color-text-muted: #9ca3af;

      /* Surfaces & borders */
      --asgardeo-color-surface: #fff;
      --asgardeo-color-border: #e5e7eb;
      --asgardeo-color-hover: rgba(0, 0, 0, 0.05);

      /* Border radius */
      --asgardeo-radius-md: 6px;
      --asgardeo-radius-lg: 8px;
      --asgardeo-radius-xl: 12px;

      /* Font sizes */
      --asgardeo-font-size-xs: 0.8125rem;
      --asgardeo-font-size-sm: 0.875rem;

      display: inline-block;
    }

    .asgardeo-org-switcher {
      position: relative;
      display: inline-block;
    }

    /* Trigger */
    .asgardeo-org-switcher__trigger {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      background: none;
      border: 1px solid var(--asgardeo-color-border);
      border-radius: var(--asgardeo-radius-lg);
      cursor: pointer;
      font-family: inherit;
      transition: background-color 0.15s;

      &:hover {
        background-color: var(--asgardeo-color-hover);
      }

      &:focus {
        outline: 2px solid var(--asgardeo-color-primary);
        outline-offset: 2px;
      }
    }

    .asgardeo-org-switcher__trigger-label {
      font-size: var(--asgardeo-font-size-sm);
      font-weight: 500;
      color: var(--asgardeo-color-text);
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .asgardeo-org-switcher__trigger-icon {
      color: var(--asgardeo-color-text-secondary);
    }

    .asgardeo-org-switcher__chevron {
      color: var(--asgardeo-color-text-muted);
      transition: transform 0.2s;
      flex-shrink: 0;
    }

    .asgardeo-org-switcher__chevron--open {
      transform: rotate(180deg);
    }

    /* Dropdown content */
    .asgardeo-org-switcher__content {
      position: absolute;
      top: calc(100% + 5px);
      right: 0;
      min-width: 250px;
      max-width: 350px;
      background: var(--asgardeo-color-surface);
      border-radius: var(--asgardeo-radius-xl);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: 1px solid var(--asgardeo-color-border);
      overflow: hidden;
      z-index: 9999;
    }

    /* Header */
    .asgardeo-org-switcher__header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--asgardeo-color-border);
    }

    .asgardeo-org-switcher__header-info {
      display: flex;
      flex-direction: column;
      gap: 1px;
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }

    .asgardeo-org-switcher__header-name {
      font-size: var(--asgardeo-font-size-sm);
      font-weight: 600;
      color: var(--asgardeo-color-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .asgardeo-org-switcher__header-handle {
      font-size: var(--asgardeo-font-size-xs);
      color: var(--asgardeo-color-text-muted);
    }

    /* Section header */
    .asgardeo-org-switcher__section-header {
      padding: 8px 16px 4px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--asgardeo-color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Menu items */
    .asgardeo-org-switcher__menu {
      display: flex;
      flex-direction: column;
      padding: 4px 0;
    }

    .asgardeo-org-switcher__menu-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
      width: 100%;
      color: var(--asgardeo-color-text);
      text-decoration: none;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: var(--asgardeo-font-size-sm);
      text-align: start;
      font-family: inherit;

      &:hover {
        background-color: var(--asgardeo-color-hover);
      }
    }

    /* Empty state */
    .asgardeo-org-switcher__empty {
      padding: 16px;
      text-align: center;
      font-size: var(--asgardeo-font-size-xs);
      color: var(--asgardeo-color-text-muted);
    }

    /* Avatar */
    .asgardeo-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 500;
      overflow: hidden;
      flex-shrink: 0;
    }

    .asgardeo-avatar--square {
      border-radius: var(--asgardeo-radius-md);
    }

    .asgardeo-avatar--sm {
      width: 24px;
      height: 24px;
      font-size: 10px;
    }
  `,
  template: `
    <div class="asgardeo-org-switcher">
      <!-- Trigger button -->
      <button class="asgardeo-org-switcher__trigger" (click)="toggle($event)">
        @if (resolvedCurrentOrg(); as org) {
        <div
          class="asgardeo-avatar asgardeo-avatar--square asgardeo-avatar--sm"
          [style.background]="currentOrgGradient()"
          [style.width.px]="avatarSize()"
          [style.height.px]="avatarSize()"
        >
          {{ currentOrgInitials() }}
        </div>
        @if (showTriggerLabel()) {
        <span class="asgardeo-org-switcher__trigger-label">{{ org.name || org.id }}</span>
        } } @else {
        <svg
          class="asgardeo-org-switcher__trigger-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          [style.width.px]="avatarSize()"
          [style.height.px]="avatarSize()"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        @if (showTriggerLabel()) {
        <span class="asgardeo-org-switcher__trigger-label">Select organization</span>
        } }
        <svg
          class="asgardeo-org-switcher__chevron"
          [class.asgardeo-org-switcher__chevron--open]="isOpen()"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown -->
      @if (isOpen()) {
      <div class="asgardeo-org-switcher__content" (click)="$event.stopPropagation()">
        <!-- Current org header -->
        @if (resolvedCurrentOrg(); as org) {
        <div class="asgardeo-org-switcher__header">
          <div
            class="asgardeo-avatar asgardeo-avatar--square"
            style="width: 36px; height: 36px; font-size: 13px;"
            [style.background]="currentOrgGradient()"
          >
            {{ currentOrgInitials() }}
          </div>
          <div class="asgardeo-org-switcher__header-info">
            <span class="asgardeo-org-switcher__header-name">{{ org.name || org.id }}</span>
            @if (org.orgHandle) {
            <span class="asgardeo-org-switcher__header-handle">&#64;{{ org.orgHandle }}</span>
            }
          </div>
        </div>
        }

        <!-- Switchable orgs -->
        @if (switchableOrganizations().length > 0) {
        <div class="asgardeo-org-switcher__section-header">Switch organization</div>
        <div class="asgardeo-org-switcher__menu">
          @for (org of switchableOrganizations(); track org.id) {
          <button class="asgardeo-org-switcher__menu-item" (click)="switchTo(org)">
            <div
              class="asgardeo-avatar asgardeo-avatar--square asgardeo-avatar--sm"
              [style.background]="generateGradient(org.name || 'Org')"
            >
              {{ getInitials(org.name || 'Org') }}
            </div>
            <span>{{ org.name || org.id }}</span>
          </button>
          }
        </div>
        } @else {
        <div class="asgardeo-org-switcher__empty">No other organizations available</div>
        }

        <!-- Content projection for additional items -->
        <ng-content></ng-content>
      </div>
      }
    </div>
  `,
})
export class AsgardeoOrganizationSwitcherComponent {
  /** Whether to show the organization name next to the avatar in the trigger */
  readonly showTriggerLabel: InputSignal<boolean> = input(true);

  /** Avatar size in pixels */
  readonly avatarSize: InputSignal<number> = input(24);

  /** Override the list of organizations (defaults to orgService.myOrganizations) */
  readonly organizations: InputSignal<Organization[] | undefined> = input<Organization[] | undefined>();

  /** Override the current organization (defaults to orgService.currentOrganization) */
  readonly currentOrganization: InputSignal<Organization | undefined> = input<Organization | undefined>();

  /** Emits when an organization is selected for switching */
  readonly organizationSwitch: OutputEmitterRef<Organization> = output<Organization>();

  private orgService: AsgardeoOrganizationService = inject(AsgardeoOrganizationService);

  isOpen: WritableSignal<boolean> = signal(false);

  resolvedCurrentOrg: Signal<Organization | undefined> = computed(
    () => this.currentOrganization() || this.orgService.currentOrganization() || undefined,
  );

  switchableOrganizations: Signal<Organization[]> = computed(() => {
    const orgs: Organization[] = this.organizations() || this.orgService.myOrganizations();
    const currentId: string | undefined = this.resolvedCurrentOrg()?.id;
    return orgs.filter((o: Organization) => o.id !== currentId);
  });

  currentOrgInitials: Signal<string> = computed(() => {
    const name: string | undefined = this.resolvedCurrentOrg()?.name;
    if (!name) return 'O';
    return getInitials(name);
  });

  currentOrgGradient: Signal<string> = computed(() => {
    const name: string = this.resolvedCurrentOrg()?.name || 'Organization';
    return generateGradient(name);
  });

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
    }
  }

  toggle(event: Event): void {
    event.stopPropagation();
    this.isOpen.update((v: boolean) => !v);
  }

  async switchTo(org: Organization): Promise<void> {
    this.isOpen.set(false);
    this.organizationSwitch.emit(org);
    await this.orgService.switchOrganization(org);
  }

  readonly getInitials: (name: string) => string = getInitials;

  readonly generateGradient: (name: string) => string = generateGradient;
}
