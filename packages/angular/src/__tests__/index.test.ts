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

import {describe, it, expect} from 'vitest';

describe('@asgardeo/angular', () => {
  it('should export AsgardeoAuthService', async () => {
    const {AsgardeoAuthService} = await import('../index');
    expect(AsgardeoAuthService).toBeDefined();
  });

  it('should export AsgardeoUserService', async () => {
    const {AsgardeoUserService} = await import('../index');
    expect(AsgardeoUserService).toBeDefined();
  });

  it('should export AsgardeoOrganizationService', async () => {
    const {AsgardeoOrganizationService} = await import('../index');
    expect(AsgardeoOrganizationService).toBeDefined();
  });

  it('should export structural directives', async () => {
    const {AsgardeoSignedInDirective, AsgardeoSignedOutDirective, AsgardeoLoadingDirective} = await import('../index');
    expect(AsgardeoSignedInDirective).toBeDefined();
    expect(AsgardeoSignedOutDirective).toBeDefined();
    expect(AsgardeoLoadingDirective).toBeDefined();
  });

  it('should export organization components', async () => {
    const {
      AsgardeoOrganizationListComponent,
      AsgardeoCreateOrganizationComponent,
      AsgardeoOrganizationProfileComponent,
      AsgardeoOrganizationSwitcherComponent,
    } = await import('../index');
    expect(AsgardeoOrganizationListComponent).toBeDefined();
    expect(AsgardeoCreateOrganizationComponent).toBeDefined();
    expect(AsgardeoOrganizationProfileComponent).toBeDefined();
    expect(AsgardeoOrganizationSwitcherComponent).toBeDefined();
  });

  it('should export AsgardeoUserProfileComponent', async () => {
    const {AsgardeoUserProfileComponent} = await import('../index');
    expect(AsgardeoUserProfileComponent).toBeDefined();
  });

  it('should export AsgardeoCallbackComponent', async () => {
    const {AsgardeoCallbackComponent} = await import('../index');
    expect(AsgardeoCallbackComponent).toBeDefined();
  });
});
