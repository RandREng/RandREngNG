// import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import {
//   HTTP_INTERCEPTORS,
//   provideHttpClient,
//   withInterceptorsFromDi,
// } from '@angular/common/http';

import {
  // MsalGuard,
  // MsalInterceptor,
  // MsalBroadcastService,
  // MsalModule,
  // MsalService,
  MsalGuardConfiguration,
  MsalInterceptorConfiguration,
} from '@azure/msal-angular';

// import { LoginSubMenuComponent } from './login-sub-menu.component';
import { BrowserCacheLocation, InteractionType, IPublicClientApplication, LogLevel, PublicClientApplication } from '@azure/msal-browser';

// @NgModule({
//   exports: [LoginSubMenuComponent],
//   imports: [CommonModule, MsalModule, LoginSubMenuComponent],
//   providers: [
//     MsalService,
//     MsalGuard,
//     MsalBroadcastService,
//     {
//       provide: HTTP_INTERCEPTORS,
//       useClass: MsalInterceptor,
//       multi: true,
//     },
//     //    AuthGuard,
//     //    AuthService,
//     //    RoleGuard,
//     provideHttpClient(withInterceptorsFromDi()),
//   ],
// })
// export class MsalLibModule { }



export function loggerCallback(_logLevel: LogLevel, _message: string) {
  //  console.log(message);
}

export function TestInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.msalConfig.auth.clientId,
      authority: environment.msalConfig.auth.authority,
      redirectUri: '/',
      postLogoutRedirectUri: '/',
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
    },
    system: {
      allowPlatformBroker: false, // Disables WAM Broker
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false,
      },
    },
  });
}

export function TestInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(
    environment.apiConfig.uri,
    environment.apiConfig.scopes
  );

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}

export function TestGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: [...environment.apiConfig.scopes],
    },
    loginFailedRoute: '/login-failed',
  };
}

export const environment = {
  production: false,
  msalConfig: {
    auth: {
      clientId: 'ENTER_CLIENT_ID',
      authority: 'ENTER_AUTHORITY',
    },
  },
  apiConfig: {
    scopes: ['ENTER_SCOPE'],
    uri: 'ENTER_URI',
  },
};
