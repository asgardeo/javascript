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

import {NgTemplateOutlet} from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  model,
  output,
  signal,
  computed,
  effect,
  HostListener,
  InputSignal,
  ModelSignal,
  OutputEmitterRef,
  WritableSignal,
  Signal,
} from '@angular/core';
import {Organization, AllOrganizationsApiResponse} from '@asgardeo/browser';
import {AsgardeoAuthService} from '../../services/asgardeo-auth.service';
import {AsgardeoOrganizationService} from '../../services/asgardeo-organization.service';
import {generateGradient, getInitials} from '../../utils/avatar';

/**
 * Angular Organization List component matching the React SDK's `<OrganizationList />`.
 *
 * Displays a paginated list of organizations with "Switch" buttons and "Current" badges.
 * Supports both inline and popup (dialog) modes.
 *
 * @example
 * ```html
 * <!-- Inline mode -->
 * <asgardeo-organization-list />
 *
 * <!-- Popup mode -->
 * <asgardeo-organization-list
 *   mode="popup"
 *   [(open)]="showOrgList"
 *   [showStatus]="true"
 * />
 * ```
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  selector: 'asgardeo-organization-list',
  standalone: true,
  styles: `
    :host {
      /* Core palette */
      --asgardeo-color-primary: #4f46e5;
      --asgardeo-color-primary-hover: #4338ca;
      --asgardeo-color-primary-ring: rgba(99, 102, 241, 0.2);

      /* Text */
      --asgardeo-color-text: #111827;
      --asgardeo-color-text-secondary: #6b7280;
      --asgardeo-color-text-muted: #9ca3af;

      /* Surfaces & borders */
      --asgardeo-color-surface: #fff;
      --asgardeo-color-border: #e5e7eb;
      --asgardeo-color-hover: rgba(0, 0, 0, 0.05);

      /* Secondary button */
      --asgardeo-color-secondary: #f3f4f6;
      --asgardeo-color-secondary-hover: #e5e7eb;
      --asgardeo-color-secondary-text: #374151;

      /* Alert / error */
      --asgardeo-color-error-bg: #fef2f2;
      --asgardeo-color-error-border: #fecaca;
      --asgardeo-color-error-title: #991b1b;
      --asgardeo-color-error-text: #b91c1c;

      /* Status */
      --asgardeo-color-success: #059669;
      --asgardeo-color-success-bg: #ecfdf5;

      /* Overlay */
      --asgardeo-overlay-bg: rgba(0, 0, 0, 0.5);

      /* Border radius */
      --asgardeo-radius-sm: 4px;
      --asgardeo-radius-md: 6px;
      --asgardeo-radius-lg: 8px;
      --asgardeo-radius-xl: 12px;

      /* Font sizes */
      --asgardeo-font-size-xs: 0.8125rem;
      --asgardeo-font-size-sm: 0.875rem;
      --asgardeo-font-size-md: 1.2rem;
      --asgardeo-font-size-lg: 1.5rem;
    }

    /* Dialog Overlay */
    .asgardeo-dialog__overlay {
      position: fixed;
      inset: 0;
      background: var(--asgardeo-overlay-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .asgardeo-dialog__content {
      background: var(--asgardeo-color-surface);
      border-radius: var(--asgardeo-radius-xl);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      max-width: 600px;
      width: 90vw;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      z-index: 10000;
    }

    .asgardeo-dialog__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--asgardeo-color-border);
    }

    .asgardeo-dialog__heading {
      font-size: var(--asgardeo-font-size-md);
      font-weight: 600;
      color: var(--asgardeo-color-text);
      margin: 0;
    }

    .asgardeo-dialog__close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: none;
      border: none;
      border-radius: var(--asgardeo-radius-md);
      cursor: pointer;
      color: var(--asgardeo-color-text-secondary);

      &:hover {
        background: var(--asgardeo-color-hover);
        color: var(--asgardeo-color-text);
      }
    }

    .asgardeo-organization-list__popup {
      padding: 1.5rem;
      overflow-y: auto;
    }

    /* Alert */
    .asgardeo-alert {
      padding: 12px 16px;
      border-radius: var(--asgardeo-radius-lg);
      margin-bottom: 16px;
    }

    .asgardeo-alert--error {
      background: var(--asgardeo-color-error-bg);
      border: 1px solid var(--asgardeo-color-error-border);
    }

    .asgardeo-alert__title {
      font-size: var(--asgardeo-font-size-sm);
      font-weight: 600;
      color: var(--asgardeo-color-error-title);
    }

    .asgardeo-alert__description {
      font-size: var(--asgardeo-font-size-sm);
      color: var(--asgardeo-color-error-text);
      margin-top: 2px;
    }

    /* Loading */
    .asgardeo-organization-list__loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 48px 0;
      color: var(--asgardeo-color-text-secondary);
      font-size: var(--asgardeo-font-size-sm);
    }

    .asgardeo-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--asgardeo-color-border);
      border-top-color: var(--asgardeo-color-primary);
      border-radius: 50%;
      animation: asgardeo-spin 0.6s linear infinite;
    }

    .asgardeo-spinner--sm {
      width: 16px;
      height: 16px;
      border-width: 2px;
      margin-right: 4px;
    }

    @keyframes asgardeo-spin {
      to { transform: rotate(360deg); }
    }

    /* Empty state */
    .asgardeo-organization-list__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 48px 0;
      color: var(--asgardeo-color-text-muted);
      font-size: var(--asgardeo-font-size-sm);
    }

    .asgardeo-organization-list__empty-icon {
      width: 48px;
      height: 48px;
    }

    /* Header */
    .asgardeo-organization-list__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .asgardeo-organization-list__count {
      font-size: var(--asgardeo-font-size-sm);
      color: var(--asgardeo-color-text-secondary);
    }

    /* List item */
    .asgardeo-organization-list__item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-bottom: 1px solid var(--asgardeo-color-border);

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: var(--asgardeo-color-hover);
        border-radius: var(--asgardeo-radius-lg);
      }
    }

    .asgardeo-organization-list__item-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .asgardeo-organization-list__item-name {
      font-size: var(--asgardeo-font-size-sm);
      font-weight: 500;
      color: var(--asgardeo-color-text);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .asgardeo-organization-list__item-handle {
      font-size: var(--asgardeo-font-size-xs);
      color: var(--asgardeo-color-text-muted);
    }

    .asgardeo-organization-list__item-actions {
      flex-shrink: 0;
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
      width: 40px;
      height: 40px;
      border-radius: var(--asgardeo-radius-lg);
      font-size: 14px;
    }

    /* Badge */
    .asgardeo-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 9999px;
      background: var(--asgardeo-color-secondary);
      color: var(--asgardeo-color-secondary-text);
    }

    .asgardeo-badge--current {
      background: var(--asgardeo-color-success-bg);
      color: var(--asgardeo-color-success);
    }

    .asgardeo-badge--active {
      background: var(--asgardeo-color-success-bg);
      color: var(--asgardeo-color-success);
    }

    /* Buttons */
    .asgardeo-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      font-family: inherit;
      border-radius: var(--asgardeo-radius-md);
      transition: background-color 0.15s;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .asgardeo-btn--sm {
      padding: 4px 12px;
      font-size: var(--asgardeo-font-size-xs);
      font-weight: 500;
    }

    .asgardeo-btn--primary {
      background: var(--asgardeo-color-primary);
      color: white;

      &:hover:not(:disabled) {
        background: var(--asgardeo-color-primary-hover);
      }
    }

    .asgardeo-btn--secondary {
      background: var(--asgardeo-color-secondary);
      color: var(--asgardeo-color-secondary-text);

      &:hover:not(:disabled) {
        background: var(--asgardeo-color-secondary-hover);
      }
    }
  `,
  template: `
    <ng-template #listBody>
      <div class="asgardeo-organization-list">
        @if (error()) {
          <div class="asgardeo-alert asgardeo-alert--error">
            <div class="asgardeo-alert__title">Error</div>
            <div class="asgardeo-alert__description">{{ error() }}</div>
          </div>
        }

        @if (isLoadingAll() && organizationsWithAccess().length === 0) {
          <div class="asgardeo-organization-list__loading">
            <div class="asgardeo-spinner"></div>
            <span>Loading organizations...</span>
          </div>
        } @else if (!isLoadingAll() && organizationsWithAccess().length === 0 && !error()) {
          <div class="asgardeo-organization-list__empty">
            <svg class="asgardeo-organization-list__empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>No organizations found</span>
          </div>
        } @else {
          <div class="asgardeo-organization-list__header">
            <span class="asgardeo-organization-list__count">
              {{ organizationsWithAccess().length }} organization{{ organizationsWithAccess().length === 1 ? '' : 's' }}
            </span>
            <button class="asgardeo-btn asgardeo-btn--secondary asgardeo-btn--sm" [disabled]="isLoadingAll()" (click)="refresh()">
              @if (isLoadingAll()) {
                <div class="asgardeo-spinner asgardeo-spinner--sm"></div>
              }
              Refresh
            </button>
          </div>

          @for (org of organizationsWithAccess(); track org.id) {
            <div class="asgardeo-organization-list__item">
              <div class="asgardeo-avatar asgardeo-avatar--square" [style.background]="generateGradient(org.name || 'Org')">
                {{ getInitials(org.name || 'Org') }}
              </div>
              <div class="asgardeo-organization-list__item-info">
                <span class="asgardeo-organization-list__item-name">{{ org.name || org.id }}</span>
                @if (org.orgHandle) {
                  <span class="asgardeo-organization-list__item-handle">&#64;{{ org.orgHandle }}</span>
                }
                @if (showStatus() && org.status) {
                  <span class="asgardeo-badge"
                        [class.asgardeo-badge--active]="org.status === 'ACTIVE'">
                    {{ org.status }}
                  </span>
                }
              </div>
              <div class="asgardeo-organization-list__item-actions">
                @if (org.isCurrent) {
                  <span class="asgardeo-badge asgardeo-badge--current">Current</span>
                } @else if (org.canSwitch) {
                  <button class="asgardeo-btn asgardeo-btn--primary asgardeo-btn--sm" (click)="onSwitch(org)">
                    Switch
                  </button>
                }
              </div>
            </div>
          }
        }
      </div>
    </ng-template>

    @if (mode() === 'popup') {
      @if (open()) {
        <div class="asgardeo-dialog__overlay" (click)="onOverlayClick($event)">
          <div class="asgardeo-dialog__content" (click)="$event.stopPropagation()">
            <div class="asgardeo-dialog__header">
              <h2 class="asgardeo-dialog__heading">{{ title() }}</h2>
              <button class="asgardeo-dialog__close" (click)="close()" aria-label="Close">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="asgardeo-organization-list__popup">
              <ng-container *ngTemplateOutlet="listBody" />
            </div>
          </div>
        </div>
      }
    } @else {
      <ng-container *ngTemplateOutlet="listBody" />
    }
  `,
})
export class AsgardeoOrganizationListComponent {
  /** Display mode: inline (default) or popup dialog */
  readonly mode: InputSignal<'inline' | 'popup'> = input<'inline' | 'popup'>('inline');

  /** Whether the popup dialog is open (popup mode only). Supports two-way binding via `[(open)]`. */
  readonly open: ModelSignal<boolean> = model(false);

  /** Dialog title (popup mode only) */
  readonly title: InputSignal<string> = input('Organizations');

  /** Whether to show organization status badges */
  readonly showStatus: InputSignal<boolean> = input(false);

  /** Emits when an organization is selected for switching */
  readonly organizationSelect: OutputEmitterRef<Organization> = output<Organization>();

  private authService: AsgardeoAuthService = inject(AsgardeoAuthService);

  private orgService: AsgardeoOrganizationService = inject(AsgardeoOrganizationService);

  isLoadingAll: WritableSignal<boolean> = signal(false);

  error: WritableSignal<string | null> = signal<string | null>(null);

  private allOrganizations: WritableSignal<AllOrganizationsApiResponse | null> =
    signal<AllOrganizationsApiResponse | null>(null);

  organizationsWithAccess: Signal<(Organization & {canSwitch: boolean; isCurrent: boolean})[]> = computed(() => {
    const all: AllOrganizationsApiResponse | null = this.allOrganizations();
    const my: Organization[] = this.orgService.myOrganizations();
    const currentId: string | undefined = this.orgService.currentOrganization()?.id;
    const myIds: Set<string> = new Set(my.map((o: Organization) => o.id));

    // If we have allOrganizations response, use it; otherwise fall back to myOrganizations
    const orgList: Organization[] = all?.organizations || my;

    return orgList.map((org: Organization) => ({
      ...org,
      canSwitch: myIds.has(org.id) && org.id !== currentId,
      isCurrent: org.id === currentId,
    }));
  });

  constructor() {
    this.fetchOrganizations();

    effect(() => {
      if (!this.open()) {
        this.error.set(null);
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.mode() === 'popup' && this.open()) {
      this.close();
    }
  }

  close(): void {
    this.open.set(false);
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  async fetchOrganizations(): Promise<void> {
    this.isLoadingAll.set(true);
    this.error.set(null);
    try {
      const result: AllOrganizationsApiResponse = await this.orgService.getAllOrganizations();
      this.allOrganizations.set(result);
    } catch (err: any) {
      this.error.set(err?.message || 'Failed to fetch organizations');
    } finally {
      this.isLoadingAll.set(false);
    }
  }

  async refresh(): Promise<void> {
    await Promise.all([this.fetchOrganizations(), this.orgService.revalidateMyOrganizations()]);
  }

  async onSwitch(org: Organization): Promise<void> {
    this.organizationSelect.emit(org);
    await this.orgService.switchOrganization(org);
  }

  readonly getInitials: (name: string) => string = getInitials;

  readonly generateGradient: (inputString: string) => string = generateGradient;
}
