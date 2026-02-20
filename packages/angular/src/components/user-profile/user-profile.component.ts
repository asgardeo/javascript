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
  Component,
  inject,
  input,
  model,
  signal,
  computed,
  effect,
  HostListener,
} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {AsgardeoAuthService} from '../../services/asgardeo-auth.service';
import {AsgardeoUserService} from '../../services/asgardeo-user.service';

/** Fields that should never be displayed in the profile fields list.
 *  Matches React SDK's BaseUserProfile.fieldsToSkip. */
const FIELDS_TO_SKIP: string[] = [
  'roles.default',
  'active',
  'groups',
  'accountLocked',
  'accountDisabled',
  'oneTimePassword',
  'userSourceId',
  'idpType',
  'localCredentialExists',
  'ResourceType',
  'ExternalID',
  'MetaData',
  'verifiedMobileNumbers',
  'verifiedEmailAddresses',
  'phoneNumbers.mobile',
  'emailAddresses',
  'preferredMFAOption',
];

/** Fields that cannot be edited */
const READONLY_FIELDS: string[] = ['username', 'userName', 'user_name'];

/** Well-known SCIM2 schema IDs */
const WELL_KNOWN_USER_SCHEMA = 'urn:ietf:params:scim:schemas:core:2.0:User';

interface SchemaField {
  caseExact?: boolean;
  description?: string;
  displayName?: string;
  displayOrder?: string;
  multiValued?: boolean;
  mutability?: string;
  name?: string;
  required?: boolean;
  returned?: string;
  subAttributes?: SchemaField[];
  type?: string;
  uniqueness?: string;
  value?: any;
  path?: string;
  schemaId?: string;
}

/**
 * Angular User Profile component matching the React SDK's `<UserProfile />`.
 *
 * Supports both inline and popup (dialog) modes with SCIM schema-based
 * field rendering and inline editing.
 *
 * @example
 * ```html
 * <!-- Inline mode -->
 * <asgardeo-user-profile />
 *
 * <!-- Popup mode -->
 * <asgardeo-user-profile
 *   mode="popup"
 *   [open]="showProfile"
 *   (openChange)="showProfile = $event"
 * />
 * ```
 */
@Component({
  selector: 'asgardeo-user-profile',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <ng-template #profileBody>
      <div class="asgardeo-user-profile">
        @if (error()) {
          <div class="asgardeo-alert asgardeo-alert--error">
            <div class="asgardeo-alert__title">Error</div>
            <div class="asgardeo-alert__description">{{ error() }}</div>
          </div>
        }
        <div class="asgardeo-user-profile__summary">
          @if (profileImageUrl()) {
            <img [src]="profileImageUrl()" [alt]="displayName()" class="asgardeo-avatar asgardeo-avatar--lg" />
          } @else {
            <div class="asgardeo-avatar asgardeo-avatar--lg" [style.background]="avatarGradient()">
              {{ initials() }}
            </div>
          }
          <div class="asgardeo-user-profile__summary-name">{{ displayName() }}</div>
          @if (emailValue()) {
            <div class="asgardeo-user-profile__summary-email">{{ emailValue() }}</div>
          }
        </div>
        <div class="asgardeo-divider"></div>
        @if (visibleFields().length > 0) {
          @for (field of visibleFields(); track field.name) {
            <div class="asgardeo-user-profile__info">
              <div class="asgardeo-user-profile__field">
                <div class="asgardeo-user-profile__field-inner">
                  <div class="asgardeo-user-profile__field-label">
                    {{ field.displayName || field.description || formatLabel(field.name || '') }}
                  </div>
                  <div class="asgardeo-user-profile__field-value">
                    @if (isFieldEditing(field.name || '')) {
                      @if (field.type === 'BOOLEAN') {
                        <label class="asgardeo-checkbox">
                          <input type="checkbox" [checked]="!!getEditedValue(field.name || '')" (change)="onFieldChange(field.name || '', $any($event.target).checked)" />
                        </label>
                      } @else if (field.type === 'DATE_TIME') {
                        <input type="date" class="asgardeo-text-field" [value]="getEditedValue(field.name || '') || ''" (input)="onFieldChange(field.name || '', $any($event.target).value)" />
                      } @else {
                        <input type="text" class="asgardeo-text-field" [value]="getEditedValue(field.name || '') || ''" (input)="onFieldChange(field.name || '', $any($event.target).value)" [placeholder]="'Enter your ' + (field.displayName || field.name || '').toLowerCase()" />
                      }
                    } @else {
                      @if (hasFieldValue(field)) {
                        <span>{{ formatFieldValue(field) }}</span>
                      } @else if (editable() && !isReadonly(field)) {
                        <span class="asgardeo-user-profile__field-placeholder" (click)="toggleEdit(field.name || '')">
                          Add {{ (field.displayName || field.name || '').toLowerCase() }}
                        </span>
                      }
                    }
                  </div>
                </div>
                @if (editable() && !isReadonly(field)) {
                  <div class="asgardeo-user-profile__field-actions">
                    @if (isFieldEditing(field.name || '')) {
                      <button class="asgardeo-btn asgardeo-btn--primary asgardeo-btn--sm" (click)="saveField(field)">Save</button>
                      <button class="asgardeo-btn asgardeo-btn--secondary asgardeo-btn--sm" (click)="cancelEdit(field.name || '')">Cancel</button>
                    } @else if (hasFieldValue(field)) {
                      <button class="asgardeo-btn asgardeo-btn--icon" (click)="toggleEdit(field.name || '')" aria-label="Edit">
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
        } @else {
          @for (entry of flatProfileEntries(); track entry.key) {
            <div class="asgardeo-user-profile__info">
              <div class="asgardeo-user-profile__field">
                <div class="asgardeo-user-profile__field-inner">
                  <div class="asgardeo-user-profile__field-label">{{ formatLabel(entry.key) }}</div>
                  <div class="asgardeo-user-profile__field-value">
                    <span>{{ entry.value }}</span>
                  </div>
                </div>
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
              <h2 class="asgardeo-dialog__heading">{{ title() || 'Profile' }}</h2>
              <button class="asgardeo-dialog__close" (click)="close()" aria-label="Close">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="asgardeo-user-profile__popup">
              <ng-container *ngTemplateOutlet="profileBody" />
            </div>
          </div>
        </div>
      }
    } @else {
      <ng-container *ngTemplateOutlet="profileBody" />
    }
  `,
  styles: `
    /* ------------------------------------------------------------------ */
    /* Custom Properties — override these to theme the component.         */
    /*                                                                    */
    /* Usage:                                                             */
    /*   asgardeo-user-profile {                                          */
    /*     --asgardeo-color-primary: #0ea5e9;                             */
    /*     --asgardeo-color-primary-hover: #0284c7;                       */
    /*   }                                                                */
    /* ------------------------------------------------------------------ */
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
      padding: 2rem;
    }

    .asgardeo-dialog__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 2rem;
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

    /* Profile Content */
    .asgardeo-user-profile__popup {
      padding: 2rem;
      overflow-y: auto;
    }

    .asgardeo-user-profile {
      min-width: 0;
    }

    /* Alert */
    .asgardeo-alert {
      padding: 12px 16px;
      border-radius: var(--asgardeo-radius-lg);
      margin-bottom: 24px;
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
      border-radius: 50%;
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

    .asgardeo-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Profile Summary */
    .asgardeo-user-profile__summary {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      margin-bottom: 12px;
    }

    .asgardeo-user-profile__summary-name {
      font-size: var(--asgardeo-font-size-lg);
      font-weight: 600;
      color: var(--asgardeo-color-text);
      margin-top: 8px;
    }

    .asgardeo-user-profile__summary-email {
      font-size: var(--asgardeo-font-size-sm);
      color: var(--asgardeo-color-text-secondary);
    }

    /* Divider */
    .asgardeo-divider {
      border-bottom: 1px solid var(--asgardeo-color-border);
    }

    /* Field info row */
    .asgardeo-user-profile__info {
      padding: 12px 0;
      border-bottom: 1px solid var(--asgardeo-color-border);

      &:last-child {
        border-bottom: none;
      }
    }

    /* Field */
    .asgardeo-user-profile__field {
      display: flex;
      align-items: center;
      padding: 4px 0;
      min-height: 28px;
    }

    .asgardeo-user-profile__field-inner {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .asgardeo-user-profile__field-label {
      width: 120px;
      flex-shrink: 0;
      font-size: var(--asgardeo-font-size-sm);
      font-weight: 500;
      color: var(--asgardeo-color-text-secondary);
      line-height: 28px;
    }

    .asgardeo-user-profile__field-value {
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

    .asgardeo-user-profile__field-placeholder {
      font-style: italic;
      opacity: 0.7;
      cursor: pointer;
      text-decoration: underline;
      font-size: var(--asgardeo-font-size-sm);
    }

    .asgardeo-user-profile__field-actions {
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

    /* Checkbox */
    .asgardeo-checkbox {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .asgardeo-checkbox input {
      width: 16px;
      height: 16px;
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
})
export class AsgardeoUserProfileComponent {
  /** Display mode: inline (default) or popup dialog */
  readonly mode = input<'inline' | 'popup'>('inline');

  /** Whether the popup dialog is open (popup mode only). Supports two-way binding via `[(open)]`. */
  readonly open = model(false);

  /** Dialog title (popup mode only) */
  readonly title = input('');

  /** Whether fields can be edited */
  readonly editable = input(true);

  /** Whitelist of field names to show (if set, only these are shown) */
  readonly showFields = input<string[] | undefined>();

  /** Blacklist of field names to hide */
  readonly hideFields = input<string[] | undefined>();

  private authService = inject(AsgardeoAuthService);
  private userService = inject(AsgardeoUserService);
  private editingFields = signal<Record<string, boolean>>({});
  private editedValues = signal<Record<string, any>>({});

  constructor() {
    // Reset editing state when the popup closes
    effect(() => {
      if (!this.open()) {
        this.editingFields.set({});
        this.editedValues.set({});
        this.error.set(null);
      }
    });
  }

  error = signal<string | null>(null);

  schemasAvailable = computed(() => {
    const up = this.authService.userProfile();
    return up?.schemas && up.schemas.length > 0;
  });

  displayName = computed(() => {
    const user = this.authService.flattenedProfile() || this.authService.user();
    if (!user) return 'User';
    const u = user as Record<string, any>;
    const firstName = u['name']?.['givenName'] || u['given_name'] || '';
    const lastName = u['name']?.['familyName'] || u['family_name'] || '';
    if (firstName && lastName) return `${firstName} ${lastName}`;
    return u['userName'] || u['username'] || u['email'] || 'User';
  });

  emailValue = computed(() => {
    const user = this.authService.flattenedProfile() || this.authService.user();
    if (!user) return '';
    const u = user as Record<string, any>;
    const emails = u['emails'];
    if (Array.isArray(emails)) return emails[0] || '';
    return u['email'] || '';
  });

  profileImageUrl = computed(() => {
    const user = this.authService.flattenedProfile() || this.authService.user();
    if (!user) return null;
    const u = user as Record<string, any>;
    return u['profile'] || u['profileUrl'] || u['picture'] || u['URL'] || null;
  });

  initials = computed(() => {
    const name = this.displayName();
    return name
      .split(' ')
      .map((p: string) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  });

  avatarGradient = computed(() => {
    const name = this.displayName();
    if (!name) return 'linear-gradient(135deg, #6366f1, #8b5cf6)';
    return this.generateGradient(name);
  });

  /**
   * Flattened schema fields with current values, filtered and sorted.
   * `userProfile().schemas` is already flattened by `flattenUserSchema()` — a flat
   * array of field definitions (each with `name`, `type`, `schemaId`, `displayOrder`, etc.),
   * NOT nested schema objects with `.attributes`.
   */
  visibleFields = computed(() => {
    const up = this.authService.userProfile();
    if (!up?.schemas || up.schemas.length === 0) return [];
    const flatProfile = (this.authService.flattenedProfile() || {}) as Record<string, any>;

    return (up.schemas as any[])
      .map((field: any) => ({...field, value: flatProfile[field.name]} as SchemaField))
      .filter((f: SchemaField) => {
        if (!f.name) return false;
        if (FIELDS_TO_SKIP.includes(f.name)) return false;
        if (this.hideFields()?.includes(f.name)) return false;
        const sf = this.showFields();
        if (sf && sf.length > 0 && !sf.includes(f.name)) return false;
        if (!this.editable()) {
          return f.value !== undefined && f.value !== '' && f.value !== null;
        }
        return true;
      })
      .sort((a: SchemaField, b: SchemaField) => {
        const orderA = a.displayOrder ? parseInt(a.displayOrder, 10) : 999;
        const orderB = b.displayOrder ? parseInt(b.displayOrder, 10) : 999;
        return orderA - orderB;
      });
  });

  /** Fallback flat profile key-value pairs when no schemas available */
  flatProfileEntries = computed(() => {
    const profile = (this.authService.flattenedProfile() || this.authService.user()) as Record<string, any>;
    if (!profile) return [];

    const entries: {key: string; value: string}[] = [];

    const flatten = (obj: Record<string, any>, prefix: string = ''): void => {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (FIELDS_TO_SKIP.includes(fullKey) || FIELDS_TO_SKIP.includes(key)) continue;
        if (this.hideFields()?.includes(fullKey)) continue;
        const sf = this.showFields();
        if (sf && sf.length > 0 && !sf.includes(fullKey)) continue;
        if (value === undefined || value === '' || value === null) continue;

        if (Array.isArray(value)) {
          const displayVal = value.filter(v => v !== null && v !== undefined && v !== '').join(', ');
          if (displayVal) entries.push({key: fullKey, value: displayVal});
        } else if (typeof value === 'object') {
          flatten(value, fullKey);
        } else {
          entries.push({key: fullKey, value: String(value)});
        }
      }
    };

    flatten(profile);
    return entries.sort((a, b) => a.key.localeCompare(b.key));
  });

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

  isFieldEditing(fieldName: string): boolean {
    return this.editingFields()[fieldName] || false;
  }

  getEditedValue(fieldName: string): any {
    const edited = this.editedValues();
    if (fieldName in edited) return edited[fieldName];
    const profile = (this.authService.flattenedProfile() || {}) as Record<string, any>;
    return profile[fieldName];
  }

  toggleEdit(fieldName: string): void {
    const current = this.editingFields();
    this.editingFields.set({...current, [fieldName]: !current[fieldName]});
  }

  onFieldChange(fieldName: string, value: any): void {
    this.editedValues.update(v => ({...v, [fieldName]: value}));
  }

  cancelEdit(fieldName: string): void {
    this.editingFields.update(v => ({...v, [fieldName]: false}));
    this.editedValues.update(v => {
      const copy = {...v};
      delete copy[fieldName];
      return copy;
    });
  }

  async saveField(field: SchemaField): Promise<void> {
    if (!field.name) return;

    const fieldName = field.name;
    let fieldValue = this.getEditedValue(fieldName) ?? '';

    if (Array.isArray(fieldValue)) {
      fieldValue = fieldValue.filter((v: any) => v !== undefined && v !== null && v !== '');
    }

    let payload: Record<string, any> = {};
    if (field.schemaId && field.schemaId !== WELL_KNOWN_USER_SCHEMA) {
      payload = {[field.schemaId]: {[fieldName]: fieldValue}};
    } else {
      this.setNestedValue(payload, fieldName, fieldValue);
    }

    this.error.set(null);
    try {
      const baseUrl = this.authService.getBaseUrl();
      const instanceId = this.authService.getClient().getInstanceId();

      await this.userService.updateUser({baseUrl, instanceId, payload});

      this.editingFields.update(v => ({...v, [fieldName]: false}));
      this.editedValues.update(v => {
        const copy = {...v};
        delete copy[fieldName];
        return copy;
      });
    } catch (err: any) {
      this.error.set(err?.message || 'Failed to update profile');
    }
  }

  isReadonly(field: SchemaField): boolean {
    if (field.mutability === 'READ_ONLY') return true;
    if (field.name && READONLY_FIELDS.includes(field.name)) return true;
    return false;
  }

  hasFieldValue(field: SchemaField): boolean {
    return field.value !== undefined && field.value !== '' && field.value !== null;
  }

  formatFieldValue(field: SchemaField): string {
    const val = field.value;
    if (val === null || val === undefined) return '';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  }

  formatLabel(key: string): string {
    return key
      .split(/(?=[A-Z])|_|\./)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private setNestedValue(obj: Record<string, any>, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length; i++) {
      if (i === keys.length - 1) {
        current[keys[i]] = value;
      } else {
        if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
    }
  }

  private generateGradient(inputString: string): string {
    let hash = inputString.split('').reduce((acc: number, char: string) => {
      const charCode = char.charCodeAt(0);
      return ((acc << 5) - acc + charCode) & 0xffffffff;
    }, 0);
    const seed = Math.abs(hash);
    const hue1 = (seed + seed) % 360;
    const hue2 = (hue1 + 60 + (seed % 120)) % 360;
    const saturation = 70 + (seed % 20);
    const lightness1 = 55 + (seed % 15);
    const lightness2 = 60 + ((seed + seed) % 15);
    const angle = 45 + (seed % 91);
    return `linear-gradient(${angle}deg, hsl(${hue1}, ${saturation}%, ${lightness1}%), hsl(${hue2}, ${saturation}%, ${lightness2}%))`;
  }
}
