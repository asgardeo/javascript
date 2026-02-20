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

import {Component, OnInit, output, inject} from '@angular/core';
import {Router} from '@angular/router';
import {navigate as browserNavigate} from '@asgardeo/browser';

/**
 * Headless component that handles OAuth callback parameter forwarding.
 *
 * This component extracts OAuth parameters (code, state, error) from the URL and forwards them
 * to the original component that initiated the OAuth flow.
 *
 * Adapted from React's `<Callback>` component.
 *
 * @example
 * ```typescript
 * // In your routes
 * const routes: Routes = [
 *   { path: 'callback', component: AsgardeoCallbackComponent },
 * ];
 * ```
 */
@Component({
  selector: 'asgardeo-callback',
  standalone: true,
  template: '',
})
export class AsgardeoCallbackComponent implements OnInit {
  private router: Router | null = inject(Router, {optional: true});

  readonly error = output<Error>();

  ngOnInit(): void {
    this.processOAuthCallback();
  }

  private processOAuthCallback(): void {
    let returnPath: string = '/';

    try {
      // 1. Extract OAuth parameters from URL
      const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
      const code: string | null = urlParams.get('code');
      const state: string | null = urlParams.get('state');
      const nonce: string | null = urlParams.get('nonce');
      const oauthError: string | null = urlParams.get('error');
      const errorDescription: string | null = urlParams.get('error_description');

      // 2. Validate and retrieve OAuth state from sessionStorage
      if (!state) {
        throw new Error('Missing OAuth state parameter - possible security issue');
      }

      const storedData: string | null = sessionStorage.getItem(`asgardeo_oauth_${state}`);
      if (!storedData) {
        if (oauthError) {
          const errorMsg: string = errorDescription || oauthError || 'OAuth authentication failed';
          const err: Error = new Error(errorMsg);
          this.error.emit(err);

          const params: URLSearchParams = new URLSearchParams();
          params.set('error', oauthError);
          if (errorDescription) {
            params.set('error_description', errorDescription);
          }

          this.navigate(`/?${params.toString()}`);
          return;
        }
        throw new Error('Invalid OAuth state - possible CSRF attack');
      }

      const {path, timestamp} = JSON.parse(storedData);
      returnPath = path || '/';

      // 3. Validate state freshness
      const MAX_STATE_AGE: number = 600000; // 10 minutes
      if (Date.now() - timestamp > MAX_STATE_AGE) {
        sessionStorage.removeItem(`asgardeo_oauth_${state}`);
        throw new Error('OAuth state expired - please try again');
      }

      // 4. Clean up state
      sessionStorage.removeItem(`asgardeo_oauth_${state}`);

      // 5. Handle OAuth error response
      if (oauthError) {
        const errorMsg: string = errorDescription || oauthError || 'OAuth authentication failed';
        const err: Error = new Error(errorMsg);
        this.error.emit(err);

        const params: URLSearchParams = new URLSearchParams();
        params.set('error', oauthError);
        if (errorDescription) {
          params.set('error_description', errorDescription);
        }

        this.navigate(`${returnPath}?${params.toString()}`);
        return;
      }

      // 6. Validate required parameters
      if (!code) {
        throw new Error('Missing OAuth authorization code');
      }

      // 7. Forward OAuth code to original component
      const params: URLSearchParams = new URLSearchParams();
      params.set('code', code);
      if (nonce) {
        params.set('nonce', nonce);
      }

      this.navigate(`${returnPath}?${params.toString()}`);
    } catch (err) {
      const errorMessage: string = err instanceof Error ? err.message : 'OAuth callback processing failed';
      // eslint-disable-next-line no-console
      console.error('OAuth callback error:', err);

      this.error.emit(err instanceof Error ? err : new Error(errorMessage));

      const params: URLSearchParams = new URLSearchParams();
      params.set('error', 'callback_error');
      params.set('error_description', errorMessage);

      this.navigate(`${returnPath}?${params.toString()}`);
    }
  }

  private navigate(path: string): void {
    if (this.router) {
      this.router.navigateByUrl(path);
    } else {
      browserNavigate(path);
    }
  }
}
