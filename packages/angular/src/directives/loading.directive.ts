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
 * Structural directive that renders its template only when the SDK is in a loading state.
 * Angular equivalent of React's `<Loading>` component.
 *
 * @example
 * ```html
 * <div *asgardeoLoading>
 *   <p>Loading...</p>
 * </div>
 * ```
 */
@Directive({
  selector: '[asgardeoLoading]',
  standalone: true,
})
export class AsgardeoLoadingDirective {
  private authService: AsgardeoAuthService = inject(AsgardeoAuthService);

  private templateRef: TemplateRef<any> = inject(TemplateRef);

  private viewContainer: ViewContainerRef = inject(ViewContainerRef);

  private hasView: boolean = false;

  constructor() {
    effect(() => {
      const loading: boolean = this.authService.isLoading();
      if (loading && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!loading && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }
}
