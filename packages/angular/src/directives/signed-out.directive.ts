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

import {Directive, TemplateRef, ViewContainerRef, effect, inject} from '@angular/core';
import {AsgardeoAuthService} from '../services/asgardeo-auth.service';

/**
 * Structural directive that renders its template only when the user is NOT signed in
 * and the SDK is not in a loading state.
 * Angular equivalent of React's `<SignedOut>` component.
 *
 * @example
 * ```html
 * <div *asgardeoSignedOut>
 *   <button (click)="authService.signIn()">Sign In</button>
 * </div>
 * ```
 */
@Directive({
  selector: '[asgardeoSignedOut]',
  standalone: true,
})
export class AsgardeoSignedOutDirective {
  private authService: AsgardeoAuthService = inject(AsgardeoAuthService);

  private templateRef: TemplateRef<any> = inject(TemplateRef);

  private viewContainer: ViewContainerRef = inject(ViewContainerRef);

  private hasView: boolean = false;

  constructor() {
    effect(() => {
      const isSignedOut: boolean = !this.authService.isSignedIn() && !this.authService.isLoading();
      if (isSignedOut && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!isSignedOut && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }
}
