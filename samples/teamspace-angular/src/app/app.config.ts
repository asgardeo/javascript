import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideAsgardeo, asgardeoInterceptor} from '@asgardeo/angular';
import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideHttpClient(withInterceptors([asgardeoInterceptor])),
    provideAsgardeo({
      baseUrl: import.meta.env['VITE_ASGARDEO_BASE_URL'] || '',
      clientId: import.meta.env['VITE_ASGARDEO_CLIENT_ID'] || '',
      afterSignInUrl: import.meta.env['VITE_ASGARDEO_AFTER_SIGN_IN_URL'] || window.location.origin + '/dashboard',
      afterSignOutUrl: import.meta.env['VITE_ASGARDEO_AFTER_SIGN_OUT_URL'] || window.location.origin,
      scopes:
        'openid address email profile internal_organization_create internal_organization_view internal_organization_update internal_organization_delete internal_org_organization_update internal_org_organization_create internal_org_organization_view internal_org_organization_delete',
      ...(import.meta.env['VITE_ASGARDEO_PLATFORM'] && {platform: import.meta.env['VITE_ASGARDEO_PLATFORM']}),
      ...(import.meta.env['VITE_ASGARDEO_APPLICATION_ID'] && {applicationId: import.meta.env['VITE_ASGARDEO_APPLICATION_ID']}),
    }),
  ],
};
