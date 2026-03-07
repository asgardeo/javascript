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
import {OrganizationDetails} from '@asgardeo/browser';
import {AsgardeoOrganizationService} from '../../services/asgardeo-organization.service';
import {generateGradient, getInitials} from '../../utils/avatar';

interface FieldConfig {
  editable: boolean;
  format?: (value: any) => string;
  key: string;
  label: string;
}

function formatDate(dateString: any): string {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {day: 'numeric', month: 'long', year: 'numeric'});
  } catch {
    return String(dateString);
  }
}

const DEFAULT_FIELDS: FieldConfig[] = [
  {editable: false, key: 'id', label: 'Organization ID'},
  {editable: true, key: 'name', label: 'Organization Name'},
  {editable: true, key: 'description', label: 'Description'},
  {editable: false, format: formatDate, key: 'created', label: 'Created Date'},
  {editable: false, format: formatDate, key: 'lastModified', label: 'Last Modified'},
];

/**
 * Angular Organization Profile component matching the React SDK's `<OrganizationProfile />`.
 *
 * Displays organization details with per-field inline editing.
 * Supports both inline and popup (dialog) modes.
 *
 * @example
 * ```html
 * <!-- Inline mode with org ID -->
 * <asgardeo-organization-profile [organizationId]="orgId" />
 *
 * <!-- Popup mode with passed data -->
 * <asgardeo-organization-profile
 *   mode="popup"
 *   [(open)]="showOrgProfile"
 *   [organization]="orgData"
 * />
 * ```
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  selector: 'asgardeo-organization-profile',
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
      --asgardeo-color-input-border: #d1d5db;
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

    .asgardeo-organization-profile__popup {
      padding: 1.5rem;
      overflow-y: auto;
    }

    /* Loading */
    .asgardeo-organization-profile__loading {
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

    @keyframes asgardeo-spin {
      to { transform: rotate(360deg); }
    }

    /* Empty state */
    .asgardeo-organization-profile__empty {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 0;
      color: var(--asgardeo-color-text-muted);
      font-size: var(--asgardeo-font-size-sm);
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

    .asgardeo-avatar--lg {
      width: 70px;
      height: 70px;
      font-size: 24px;
    }

    .asgardeo-avatar--square {
      border-radius: var(--asgardeo-radius-lg);
    }

    /* Profile Summary */
    .asgardeo-organization-profile__summary {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      margin-bottom: 12px;
    }

    .asgardeo-organization-profile__summary-name {
      font-size: var(--asgardeo-font-size-lg);
      font-weight: 600;
      color: var(--asgardeo-color-text);
      margin-top: 8px;
    }

    .asgardeo-organization-profile__summary-handle {
      font-size: var(--asgardeo-font-size-sm);
      color: var(--asgardeo-color-text-secondary);
    }

    /* Divider */
    .asgardeo-divider {
      border-bottom: 1px solid var(--asgardeo-color-border);
    }

    /* Field info row */
    .asgardeo-organization-profile__info {
      padding: 12px 0;
      border-bottom: 1px solid var(--asgardeo-color-border);

      &:last-child {
        border-bottom: none;
      }
    }

    .asgardeo-organization-profile__field {
      display: flex;
      align-items: center;
      padding: 4px 0;
      min-height: 28px;
    }

    .asgardeo-organization-profile__field-inner {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .asgardeo-organization-profile__field-label {
      width: 140px;
      flex-shrink: 0;
      font-size: var(--asgardeo-font-size-sm);
      font-weight: 500;
      color: var(--asgardeo-color-text-secondary);
      line-height: 28px;
    }

    .asgardeo-organization-profile__field-value {
      flex: 1;
      font-size: var(--asgardeo-font-size-sm);
      color: var(--asgardeo-color-text);
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 350px;
      line-height: 28px;
      word-break: break-word;
    }

    .asgardeo-organization-profile__field-placeholder {
      font-style: italic;
      opacity: 0.7;
      cursor: pointer;
      text-decoration: underline;
      font-size: var(--asgardeo-font-size-sm);
    }

    .asgardeo-organization-profile__field-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-left: 32px;
    }

    /* Text Field */
    .asgardeo-text-field {
      width: 100%;
      max-width: 280px;
      padding: 6px 10px;
      font-size: var(--asgardeo-font-size-sm);
      border: 1px solid var(--asgardeo-color-input-border);
      border-radius: var(--asgardeo-radius-md);
      outline: none;
      font-family: inherit;

      &:focus {
        border-color: var(--asgardeo-color-primary);
        box-shadow: 0 0 0 2px var(--asgardeo-color-primary-ring);
      }
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
    }

    .asgardeo-btn--sm {
      padding: 4px 12px;
      font-size: var(--asgardeo-font-size-xs);
      font-weight: 500;
    }

    .asgardeo-btn--primary {
      background: var(--asgardeo-color-primary);
      color: white;

      &:hover {
        background: var(--asgardeo-color-primary-hover);
      }
    }

    .asgardeo-btn--secondary {
      background: var(--asgardeo-color-secondary);
      color: var(--asgardeo-color-secondary-text);

      &:hover {
        background: var(--asgardeo-color-secondary-hover);
      }
    }

    .asgardeo-btn--icon {
      width: 28px;
      height: 28px;
      padding: 0;
      background: none;
      color: var(--asgardeo-color-text-muted);
      border-radius: var(--asgardeo-radius-sm);

      &:hover {
        background: var(--asgardeo-color-hover);
        color: var(--asgardeo-color-text-secondary);
      }
    }
  `,
  template: `
    <ng-template #profileBody>
      <div class="asgardeo-organization-profile">
        @if (error()) {
          <div class="asgardeo-alert asgardeo-alert--error">
            <div class="asgardeo-alert__title">Error</div>
            <div class="asgardeo-alert__description">{{ error() }}</div>
          </div>
        }

        @if (isLoadingDetails()) {
          <div class="asgardeo-organization-profile__loading">
            <div class="asgardeo-spinner"></div>
            <span>Loading organization...</span>
          </div>
        } @else if (resolvedOrganization(); as org) {
          <!-- Header: Avatar + Name + Handle -->
          <div class="asgardeo-organization-profile__summary">
            <div class="asgardeo-avatar asgardeo-avatar--lg asgardeo-avatar--square" [style.background]="avatarGradient()">
              {{ orgInitials() }}
            </div>
            <div class="asgardeo-organization-profile__summary-name">{{ org.name }}</div>
            @if (org.orgHandle) {
              <div class="asgardeo-organization-profile__summary-handle">&#64;{{ org.orgHandle }}</div>
            }
          </div>

          <div class="asgardeo-divider"></div>

          @for (field of fields; track field.key) {
            @if (getFieldValue(org, field.key) !== undefined || (editable() && field.editable)) {
              <div class="asgardeo-organization-profile__info">
                <div class="asgardeo-organization-profile__field">
                  <div class="asgardeo-organization-profile__field-inner">
                    <div class="asgardeo-organization-profile__field-label">{{ field.label }}</div>
                    <div class="asgardeo-organization-profile__field-value">
                      @if (isFieldEditing(field.key)) {
                        <input
                          type="text"
                          class="asgardeo-text-field"
                          [value]="getEditedValue(field.key) || ''"
                          (input)="onFieldChange(field.key, $any($event.target).value)"
                          [placeholder]="'Enter ' + field.label.toLowerCase()"
                        />
                      } @else {
                        @if (getFieldValue(org, field.key) != null && getFieldValue(org, field.key) !== '') {
                          <span>{{ field.format ? field.format(getFieldValue(org, field.key)) : getFieldValue(org, field.key) }}</span>
                        } @else if (editable() && field.editable) {
                          <span class="asgardeo-organization-profile__field-placeholder" (click)="toggleEdit(field.key)">
                            Add {{ field.label.toLowerCase() }}
                          </span>
                        } @else {
                          <span>-</span>
                        }
                      }
                    </div>
                  </div>
                  @if (editable() && field.editable) {
                    <div class="asgardeo-organization-profile__field-actions">
                      @if (isFieldEditing(field.key)) {
                        <button class="asgardeo-btn asgardeo-btn--primary asgardeo-btn--sm" (click)="saveField(field)">Save</button>
                        <button class="asgardeo-btn asgardeo-btn--secondary asgardeo-btn--sm" (click)="cancelEdit(field.key)">Cancel</button>
                      } @else if (getFieldValue(org, field.key) != null && getFieldValue(org, field.key) !== '') {
                        <button class="asgardeo-btn asgardeo-btn--icon" (click)="toggleEdit(field.key)" aria-label="Edit">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          }
        } @else if (!isLoadingDetails()) {
          <div class="asgardeo-organization-profile__empty">No organization data available</div>
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
            <div class="asgardeo-organization-profile__popup">
              <ng-container *ngTemplateOutlet="profileBody" />
            </div>
          </div>
        </div>
      }
    } @else {
      <ng-container *ngTemplateOutlet="profileBody" />
    }
  `,
})
export class AsgardeoOrganizationProfileComponent {
  /** Display mode: inline (default) or popup dialog */
  readonly mode: InputSignal<'inline' | 'popup'> = input<'inline' | 'popup'>('inline');

  /** Whether the popup dialog is open (popup mode only). Supports two-way binding via `[(open)]`. */
  readonly open: ModelSignal<boolean> = model(false);

  /** Dialog title (popup mode only) */
  readonly title: InputSignal<string> = input('Organization Profile');

  /** Whether fields can be edited */
  readonly editable: InputSignal<boolean> = input(true);

  /** Organization ID to fetch details for */
  readonly organizationId: InputSignal<string | undefined> = input<string | undefined>();

  /** Organization data to display directly (alternative to organizationId) */
  readonly organization: InputSignal<OrganizationDetails | undefined> = input<OrganizationDetails | undefined>();

  /** Emits when the organization is updated */
  readonly updated: OutputEmitterRef<OrganizationDetails> = output<OrganizationDetails>();

  private orgService: AsgardeoOrganizationService = inject(AsgardeoOrganizationService);

  private fetchedOrganization: WritableSignal<OrganizationDetails | null> = signal<OrganizationDetails | null>(null);

  private editingFields: WritableSignal<Record<string, boolean>> = signal<Record<string, boolean>>({});

  private editedValues: WritableSignal<Record<string, any>> = signal<Record<string, any>>({});

  error: WritableSignal<string | null> = signal<string | null>(null);

  isLoadingDetails: WritableSignal<boolean> = signal(false);

  readonly fields: FieldConfig[] = DEFAULT_FIELDS;

  resolvedOrganization: Signal<OrganizationDetails | null> = computed(
    () => this.organization() || this.fetchedOrganization(),
  );

  orgInitials: Signal<string> = computed(() => {
    const name: string | undefined = this.resolvedOrganization()?.name;
    if (!name) return 'ORG';
    return getInitials(name);
  });

  avatarGradient: Signal<string> = computed(() => {
    const name: string = this.resolvedOrganization()?.name || 'Organization';
    return generateGradient(name);
  });

  constructor() {
    // Fetch organization when organizationId changes
    effect(() => {
      const id: string | undefined = this.organizationId();
      if (id) {
        this.fetchOrganization(id);
      }
    });

    // Reset editing state when popup closes
    effect(() => {
      if (!this.open()) {
        this.editingFields.set({});
        this.editedValues.set({});
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

  async fetchOrganization(id: string): Promise<void> {
    this.isLoadingDetails.set(true);
    this.error.set(null);
    try {
      const result: OrganizationDetails = await this.orgService.getOrganization(id);
      this.fetchedOrganization.set(result);
    } catch (err: any) {
      this.error.set(err?.message || 'Failed to load organization');
    } finally {
      this.isLoadingDetails.set(false);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getFieldValue(org: OrganizationDetails, key: string): any {
    return (org as Record<string, any>)[key];
  }

  isFieldEditing(fieldKey: string): boolean {
    return this.editingFields()[fieldKey] || false;
  }

  getEditedValue(fieldKey: string): any {
    const edited: Record<string, any> = this.editedValues();
    if (fieldKey in edited) return edited[fieldKey];
    const org: OrganizationDetails | null = this.resolvedOrganization();
    return org ? this.getFieldValue(org, fieldKey) : '';
  }

  toggleEdit(fieldKey: string): void {
    this.editingFields.update((v: Record<string, boolean>) => ({...v, [fieldKey]: !v[fieldKey]}));
  }

  onFieldChange(fieldKey: string, value: any): void {
    this.editedValues.update((v: Record<string, any>) => ({...v, [fieldKey]: value}));
  }

  cancelEdit(fieldKey: string): void {
    this.editingFields.update((v: Record<string, boolean>) => ({...v, [fieldKey]: false}));
    this.editedValues.update((v: Record<string, any>) => {
      const copy: Record<string, any> = {...v};
      delete copy[fieldKey];
      return copy;
    });
  }

  async saveField(field: FieldConfig): Promise<void> {
    const org: OrganizationDetails | null = this.resolvedOrganization();
    if (!org) return;

    const value: any = this.getEditedValue(field.key);
    this.error.set(null);

    try {
      const updated: OrganizationDetails = await this.orgService.updateOrganization(org.id, {[field.key]: value});
      this.fetchedOrganization.set(updated);
      this.editingFields.update((v: Record<string, boolean>) => ({...v, [field.key]: false}));
      this.editedValues.update((v: Record<string, any>) => {
        const copy: Record<string, any> = {...v};
        delete copy[field.key];
        return copy;
      });
      this.updated.emit(updated);
    } catch (err: any) {
      this.error.set(err?.message || 'Failed to update organization');
    }
  }
}
