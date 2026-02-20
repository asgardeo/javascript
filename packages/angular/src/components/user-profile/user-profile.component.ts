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
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  computed,
  OnChanges,
  SimpleChanges,
  HostListener,
} from '@angular/core';
import {AsgardeoAuthService} from '../../services/asgardeo-auth.service';
import updateMeProfile from '../../api/updateMeProfile';

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
  template: `
    @if (mode === 'popup') {
      @if (open) {
        <div class="asgardeo-dialog__overlay" (click)="onOverlayClick($event)">
          <div class="asgardeo-dialog__content" (click)="$event.stopPropagation()">
            <div class="asgardeo-dialog__header">
              <h2 class="asgardeo-dialog__heading">{{ title || 'Profile' }}</h2>
              <button class="asgardeo-dialog__close" (click)="close()" aria-label="Close">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="asgardeo-user-profile__popup">
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
                              } @else if (editable && !isReadonly(field)) {
                                <span class="asgardeo-user-profile__field-placeholder" (click)="toggleEdit(field.name || '')">
                                  Add {{ (field.displayName || field.name || '').toLowerCase() }}
                                </span>
                              }
                            }
                          </div>
                        </div>
                        @if (editable && !isReadonly(field)) {
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
            </div>
          </div>
        </div>
      }
    } @else {
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
                    } @else if (editable && !isReadonly(field)) {
                      <span class="asgardeo-user-profile__field-placeholder" (click)="toggleEdit(field.name || '')">
                        Add {{ (field.displayName || field.name || '').toLowerCase() }}
                      </span>
                    }
                  }
                </div>
              </div>
              @if (editable && !isReadonly(field)) {
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
    }
  `,
  styles: `
    /* Dialog Overlay */
    .asgardeo-dialog__overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .asgardeo-dialog__content {
      background: #fff;
      border-radius: 12px;
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
      border-bottom: 1px solid #e5e7eb;
    }

    .asgardeo-dialog__heading {
      font-size: 1.2rem;
      font-weight: 600;
      color: #111827;
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
      border-radius: 6px;
      cursor: pointer;
      color: #6b7280;

      &:hover {
        background: rgba(0, 0, 0, 0.05);
        color: #111827;
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
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .asgardeo-alert--error {
      background: #fef2f2;
      border: 1px solid #fecaca;
    }

    .asgardeo-alert__title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #991b1b;
    }

    .asgardeo-alert__description {
      font-size: 0.875rem;
      color: #b91c1c;
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
      font-size: 1.5rem;
      font-weight: 600;
      color: #111827;
      margin-top: 8px;
    }

    .asgardeo-user-profile__summary-email {
      font-size: 0.875rem;
      color: #6b7280;
    }

    /* Divider */
    .asgardeo-divider {
      border-bottom: 1px solid #e5e7eb;
    }

    /* Field info row — wraps each field + divider with vertical padding and bottom border */
    .asgardeo-user-profile__info {
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;

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
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
      line-height: 28px;
    }

    .asgardeo-user-profile__field-value {
      flex: 1;
      font-size: 0.875rem;
      color: #111827;
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
      font-size: 0.875rem;
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
      font-size: 0.875rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      outline: none;
      font-family: inherit;

      &:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
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
      border-radius: 6px;
      transition: background-color 0.15s;
    }

    .asgardeo-btn--sm {
      padding: 4px 12px;
      font-size: 0.8125rem;
      font-weight: 500;
    }

    .asgardeo-btn--primary {
      background: #4f46e5;
      color: white;

      &:hover {
        background: #4338ca;
      }
    }

    .asgardeo-btn--secondary {
      background: #f3f4f6;
      color: #374151;

      &:hover {
        background: #e5e7eb;
      }
    }

    .asgardeo-btn--icon {
      width: 28px;
      height: 28px;
      padding: 0;
      background: none;
      color: #9ca3af;
      border-radius: 4px;

      &:hover {
        background: rgba(0, 0, 0, 0.05);
        color: #6b7280;
      }
    }
  `,
})
export class AsgardeoUserProfileComponent implements OnChanges {
  /** Display mode: inline (default) or popup dialog */
  @Input() mode: 'inline' | 'popup' = 'inline';

  /** Whether the popup dialog is open (popup mode only) */
  @Input() open = false;

  /** Dialog title (popup mode only) */
  @Input() title = '';

  /** Whether fields can be edited */
  @Input() editable = true;

  /** Whitelist of field names to show (if set, only these are shown) */
  @Input() showFields?: string[];

  /** Blacklist of field names to hide */
  @Input() hideFields?: string[];

  /** Emitted when the popup open state changes */
  @Output() openChange = new EventEmitter<boolean>();

  private authService = inject(AsgardeoAuthService);
  private editingFields = signal<Record<string, boolean>>({});
  private editedValues = signal<Record<string, any>>({});

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
        if (this.hideFields?.includes(f.name)) return false;
        if (this.showFields && this.showFields.length > 0 && !this.showFields.includes(f.name)) return false;
        if (!this.editable) {
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
        if (this.hideFields?.includes(fullKey)) continue;
        if (this.showFields && this.showFields.length > 0 && !this.showFields.includes(fullKey)) continue;
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && !changes['open'].currentValue) {
      this.editingFields.set({});
      this.editedValues.set({});
      this.error.set(null);
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.mode === 'popup' && this.open) {
      this.close();
    }
  }

  close(): void {
    this.openChange.emit(false);
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

      const response = await updateMeProfile({baseUrl, instanceId, payload});

      // Update cached user & profile signals from the SCIM response
      this.authService.handleProfileUpdate(response);

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
