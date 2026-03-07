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
  effect,
  HostListener,
  InputSignal,
  ModelSignal,
  OutputEmitterRef,
  WritableSignal,
} from '@angular/core';
import {Organization} from '@asgardeo/browser';
import {AsgardeoAuthService} from '../../services/asgardeo-auth.service';
import {AsgardeoOrganizationService} from '../../services/asgardeo-organization.service';

interface CreateOrganizationPayload {
  description: string;
  name: string;
  orgHandle: string;
  parentId: string;
  type: 'TENANT';
}

/**
 * Angular Create Organization component matching the React SDK's `<CreateOrganization />`.
 *
 * Provides a form for creating new organizations with name, handle, and description fields.
 * Supports both inline and popup (dialog) modes.
 *
 * @example
 * ```html
 * <!-- Inline mode -->
 * <asgardeo-create-organization
 *   (created)="onOrgCreated($event)"
 *   (cancelled)="onCancel()"
 * />
 *
 * <!-- Popup mode -->
 * <asgardeo-create-organization
 *   mode="popup"
 *   [(open)]="showCreateOrg"
 * />
 * ```
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  selector: 'asgardeo-create-organization',
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
      max-width: 500px;
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

    .asgardeo-create-organization__popup {
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

    /* Form */
    .asgardeo-form-group {
      margin-bottom: 20px;
    }

    .asgardeo-label {
      display: block;
      font-size: var(--asgardeo-font-size-sm);
      font-weight: 500;
      color: var(--asgardeo-color-text);
      margin-bottom: 6px;
    }

    .asgardeo-required {
      color: var(--asgardeo-color-error-text);
    }

    .asgardeo-text-field {
      width: 100%;
      padding: 8px 12px;
      font-size: var(--asgardeo-font-size-sm);
      border: 1px solid var(--asgardeo-color-input-border);
      border-radius: var(--asgardeo-radius-md);
      outline: none;
      font-family: inherit;
      box-sizing: border-box;

      &:focus {
        border-color: var(--asgardeo-color-primary);
        box-shadow: 0 0 0 2px var(--asgardeo-color-primary-ring);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .asgardeo-text-field--error {
      border-color: var(--asgardeo-color-error-text);
    }

    .asgardeo-textarea {
      width: 100%;
      padding: 8px 12px;
      font-size: var(--asgardeo-font-size-sm);
      border: 1px solid var(--asgardeo-color-input-border);
      border-radius: var(--asgardeo-radius-md);
      outline: none;
      font-family: inherit;
      resize: vertical;
      box-sizing: border-box;

      &:focus {
        border-color: var(--asgardeo-color-primary);
        box-shadow: 0 0 0 2px var(--asgardeo-color-primary-ring);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .asgardeo-textarea--error {
      border-color: var(--asgardeo-color-error-text);
    }

    .asgardeo-form-hint {
      display: block;
      font-size: var(--asgardeo-font-size-xs);
      color: var(--asgardeo-color-text-muted);
      margin-top: 4px;
    }

    .asgardeo-form-error {
      display: block;
      font-size: var(--asgardeo-font-size-xs);
      color: var(--asgardeo-color-error-text);
      margin-top: 4px;
    }

    .asgardeo-form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 24px;
    }

    /* Spinner */
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
      border-color: rgba(255, 255, 255, 0.3);
      border-top-color: white;
      margin-right: 6px;
    }

    @keyframes asgardeo-spin {
      to { transform: rotate(360deg); }
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
      padding: 8px 16px;
      font-size: var(--asgardeo-font-size-sm);
      font-weight: 500;
      transition: background-color 0.15s;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
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
    <ng-template #createBody>
      <div class="asgardeo-create-organization">
        @if (error()) {
          <div class="asgardeo-alert asgardeo-alert--error">
            <div class="asgardeo-alert__title">Error</div>
            <div class="asgardeo-alert__description">{{ error() }}</div>
          </div>
        }

        <form (submit)="onSubmit(); $event.preventDefault()">
          <div class="asgardeo-form-group">
            <label class="asgardeo-label">Organization Name <span class="asgardeo-required">*</span></label>
            <input
              type="text"
              class="asgardeo-text-field"
              [class.asgardeo-text-field--error]="formErrors().name"
              [value]="formName()"
              (input)="onNameInput($any($event.target).value)"
              placeholder="Enter organization name"
              [disabled]="isSubmitting()"
            />
            @if (formErrors().name) {
              <span class="asgardeo-form-error">{{ formErrors().name }}</span>
            }
          </div>

          <div class="asgardeo-form-group">
            <label class="asgardeo-label">Organization Handle <span class="asgardeo-required">*</span></label>
            <input
              type="text"
              class="asgardeo-text-field"
              [class.asgardeo-text-field--error]="formErrors().handle"
              [value]="formHandle()"
              (input)="onHandleInput($any($event.target).value)"
              placeholder="my-organization"
              [disabled]="isSubmitting()"
            />
            <span class="asgardeo-form-hint">Only lowercase letters, numbers, and hyphens are allowed.</span>
            @if (formErrors().handle) {
              <span class="asgardeo-form-error">{{ formErrors().handle }}</span>
            }
          </div>

          <div class="asgardeo-form-group">
            <label class="asgardeo-label">Description <span class="asgardeo-required">*</span></label>
            <textarea
              class="asgardeo-textarea"
              [class.asgardeo-textarea--error]="formErrors().description"
              [value]="formDescription()"
              (input)="onDescriptionInput($any($event.target).value)"
              placeholder="Describe your organization"
              rows="3"
              [disabled]="isSubmitting()"
            ></textarea>
            @if (formErrors().description) {
              <span class="asgardeo-form-error">{{ formErrors().description }}</span>
            }
          </div>

          <div class="asgardeo-form-actions">
            <button
              type="button"
              class="asgardeo-btn asgardeo-btn--secondary"
              (click)="onCancel()"
              [disabled]="isSubmitting()"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="asgardeo-btn asgardeo-btn--primary"
              [disabled]="isSubmitting() || !formName().trim()"
            >
              @if (isSubmitting()) {
                <div class="asgardeo-spinner asgardeo-spinner--sm"></div>
                Creating...
              } @else {
                Create Organization
              }
            </button>
          </div>
        </form>
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
            <div class="asgardeo-create-organization__popup">
              <ng-container *ngTemplateOutlet="createBody" />
            </div>
          </div>
        </div>
      }
    } @else {
      <ng-container *ngTemplateOutlet="createBody" />
    }
  `,
})
export class AsgardeoCreateOrganizationComponent {
  /** Display mode: inline (default) or popup dialog */
  readonly mode: InputSignal<'inline' | 'popup'> = input<'inline' | 'popup'>('inline');

  /** Whether the popup dialog is open (popup mode only). Supports two-way binding via `[(open)]`. */
  readonly open: ModelSignal<boolean> = model(false);

  /** Dialog title (popup mode only) */
  readonly title: InputSignal<string> = input('Create Organization');

  /** Default parent organization ID */
  readonly defaultParentId: InputSignal<string> = input('');

  /** Initial form values */
  readonly initialValues: InputSignal<Partial<{description: string; handle: string; name: string}>> = input<
    Partial<{description: string; handle: string; name: string}>
  >({});

  /** Emits when the form is submitted (before API call) */
  readonly submitted: OutputEmitterRef<CreateOrganizationPayload> = output<CreateOrganizationPayload>();

  /** Emits when the organization is successfully created */
  readonly created: OutputEmitterRef<Organization> = output<Organization>();

  /** Emits when the cancel button is clicked */
  readonly cancelled: OutputEmitterRef<void> = output<void>();

  private readonly authService: AsgardeoAuthService = inject(AsgardeoAuthService);

  private readonly orgService: AsgardeoOrganizationService = inject(AsgardeoOrganizationService);

  formName: WritableSignal<string> = signal('');

  formHandle: WritableSignal<string> = signal('');

  formDescription: WritableSignal<string> = signal('');

  isSubmitting: WritableSignal<boolean> = signal(false);

  error: WritableSignal<string | null> = signal<string | null>(null);

  formErrors: WritableSignal<{description?: string; handle?: string; name?: string}> = signal<{
    description?: string;
    handle?: string;
    name?: string;
  }>({});

  private readonly handleManuallyEdited: WritableSignal<boolean> = signal(false);

  constructor() {
    // Reset form when popup closes
    effect(() => {
      if (!this.open()) {
        this.resetForm();
      }
    });

    // Apply initial values
    effect(() => {
      const iv: Partial<{description: string; handle: string; name: string}> = this.initialValues();
      if (iv.name) this.formName.set(iv.name);
      if (iv.handle) this.formHandle.set(iv.handle);
      if (iv.description) this.formDescription.set(iv.description);
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

  onNameInput(value: string): void {
    this.formName.set(value);
    this.clearFieldError('name');
    if (!this.handleManuallyEdited()) {
      this.formHandle.set(AsgardeoCreateOrganizationComponent.generateHandle(value));
    }
  }

  onHandleInput(value: string): void {
    this.formHandle.set(value);
    this.handleManuallyEdited.set(true);
    this.clearFieldError('handle');
  }

  onDescriptionInput(value: string): void {
    this.formDescription.set(value);
    this.clearFieldError('description');
  }

  static generateHandle(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  validate(): boolean {
    const errors: {description?: string; handle?: string; name?: string} = {};
    if (!this.formName().trim()) errors.name = 'Organization name is required';
    if (!this.formHandle().trim()) {
      errors.handle = 'Organization handle is required';
    } else if (!/^[a-z0-9-]+$/.test(this.formHandle())) {
      errors.handle = 'Handle can only contain lowercase letters, numbers, and hyphens';
    }
    if (!this.formDescription().trim()) errors.description = 'Description is required';
    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  async onSubmit(): Promise<void> {
    if (!this.validate() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.error.set(null);

    const payload: CreateOrganizationPayload = {
      description: this.formDescription().trim(),
      name: this.formName().trim(),
      orgHandle: this.formHandle().trim(),
      parentId: this.defaultParentId() || this.orgService.currentOrganization()?.id || '',
      type: 'TENANT' as const,
    };

    this.submitted.emit(payload);

    try {
      const baseUrl: string = this.authService.getBaseUrl();
      const instanceId: number = this.authService.getClient().getInstanceId();
      const org: Organization = await this.orgService.createOrganization({baseUrl, instanceId, payload});
      await this.orgService.revalidateMyOrganizations();
      this.created.emit(org);
      if (this.mode() === 'popup') {
        this.open.set(false);
      }
    } catch (err: any) {
      this.error.set(err?.message || 'Failed to create organization');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onCancel(): void {
    this.cancelled.emit();
    if (this.mode() === 'popup') {
      this.open.set(false);
    }
  }

  private resetForm(): void {
    this.formName.set('');
    this.formHandle.set('');
    this.formDescription.set('');
    this.error.set(null);
    this.formErrors.set({});
    this.handleManuallyEdited.set(false);
    this.isSubmitting.set(false);
  }

  private clearFieldError(field: string): void {
    this.formErrors.update((v: {description?: string; handle?: string; name?: string}) => {
      const copy: {description?: string; handle?: string; name?: string} = {...v};
      delete (copy as any)[field];
      return copy;
    });
  }
}
