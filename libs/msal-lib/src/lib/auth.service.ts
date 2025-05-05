import { Inject, Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
  MsalBroadcastService,
  MsalGuardConfiguration,
  MsalService,
  MSAL_GUARD_CONFIG,
} from '@azure/msal-angular';
import {
  AccountInfo,
  AuthenticationResult,
  EventMessage,
  EventType,
  InteractionStatus,
  InteractionType,
  PopupRequest,
  RedirectRequest,
} from '@azure/msal-browser';

import { AlertService } from '@ngIM/randr-lib';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface Account extends AccountInfo {
  idTokenClaims?: {
    roles?: string[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public Authenticated$ = new ReplaySubject<boolean>();
  public initialized = false

  constructor(
    //    private router: Router,
    //        private alertService: AlertService,
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private broadcastService: MsalBroadcastService,
    private msalService: MsalService,
    private alertService: AlertService
  ) {
    // this.msalService.setLogger(
    //   new Logger({
    //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //     loggerCallback: (logLevel, message, _piiEnabled) => {
    //       //                this.alertService.AddInfoMessage(`MSAL Logging: ${message}`);
    //       console.log(`MSAL Logging: ${message}`);
    //     },
    //     piiLoggingEnabled: false,
    //     logLevel: LogLevel.Warning,
    //   })
    // );
    this.msalService.initialize().subscribe(() => {
      this.initialized = true;
    }),

      this.msalService.handleRedirectObservable().subscribe();

    this.broadcastService.msalSubject$
      .pipe(
        filter(
          (msg: EventMessage) =>
            msg.eventType === EventType.LOGIN_SUCCESS ||
            msg.eventType === EventType.LOGOUT_SUCCESS
        ),
        takeUntilDestroyed()
      )
      .subscribe((result: EventMessage) => {
        console.log(result);
        if (result.eventType === EventType.LOGIN_SUCCESS) {
          const payload = result.payload as AuthenticationResult;
          this.msalService.instance.setActiveAccount(payload.account);
          //                    this.msalService.instance.getActiveAccount().idTokenClaims.
          this.Authenticated$.next(true);
        } else if (result.eventType === EventType.LOGOUT_SUCCESS) {
          this.Authenticated$.next(false);
        }
      });

    this.broadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None)
      )
      .subscribe(() => {
        //          this.setLoginDisplay();
        this.checkAndSetActiveAccount();
        //          this.getClaims(this.authService.instance.getActiveAccount()?.idTokenClaims)
      });

    //    });
  }

  private init(): void {
  }

  checkAndSetActiveAccount(): void {
    console.log("checkAndSetActiveAccount");
    /**
     * If no active account set but there are accounts signed in, sets first account to active account
     * To use active account set here, subscribe to inProgress$ first in your component
     * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
     */
    const activeAccount = this.msalService.instance.getActiveAccount();

    if (
      !activeAccount &&
      this.msalService.instance.getAllAccounts().length > 0
    ) {
      const accounts = this.msalService.instance.getAllAccounts();
      this.msalService.instance.setActiveAccount(accounts[0]);
      this.Authenticated$.next(true);
    } else if (activeAccount) {
      this.Authenticated$.next(true);
    }
  }

  get userName(): string | undefined {
    console.log("get UserName");
    return this.msalService.instance.getActiveAccount()?.name;
  }

  getClaims() {
    console.log("getClaims")
    return this.msalService.instance.getActiveAccount()?.idTokenClaims;
  }

  login(): void {
    console.log("login");
    //        const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

    //        if (isIE) {
    //            this.msalService.loginRedirect();
    //        } else {
    //            this.msalService.loginPopup();
    //        }

    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
      if (this.msalGuardConfig.authRequest) {
        this.msalService
          .loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest)
          .subscribe((response: AuthenticationResult) => {
            this.msalService.instance.setActiveAccount(response.account);
          });
      } else {
        this.msalService
          .loginPopup()
          .subscribe((response: AuthenticationResult) => {
            this.msalService.instance.setActiveAccount(response.account);
          });
      }
    } else {
      if (this.msalGuardConfig.authRequest) {
        this.msalService.loginRedirect({
          ...this.msalGuardConfig.authRequest,
        } as RedirectRequest);
      } else {
        this.msalService.loginRedirect();
      }
    }
  }

  logout(): void {
    console.log("logout");
    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
      this.msalService.logoutPopup({
        mainWindowRedirectUri: '/',
      });
    } else {
      this.msalService.logoutRedirect();
    }
  }

  isAuthenticate(): boolean {
    console.log("isAuthenticate");
    if (this.initialized) {
      const account: Account | null =
        this.msalService.instance.getActiveAccount();
      if (!account) {
        return false;
      } else {
        return true;
      }
    }
    else {
      return false;
    }
  }

  hasCommonRole(roles: string[]): boolean {
    console.log("hasCommonRole");
    if (this.initialized) {
      const account: Account | null =
        this.msalService.instance.getActiveAccount();
      if (!account) {
        return false;
      }

      if (!account?.idTokenClaims?.roles) {
        this.alertService.AddDebugMessage(
          'Token does not have roles claim. Please ensure that your account is assigned to an app role and then sign-out and sign-in again.'
        );
        return false;
      } else if (!account?.idTokenClaims.roles.filter((x) => roles.includes(x))) {
        //        this.alertService.AddDebugMessage('You do not have access as expected role is missing. Please ensure that your account is assigned to an app role and then sign-out and sign-in again.');
        return false;
      }

      return true;
    }
    return false;
  }

  inRole(role: string): boolean {
    console.log("inRole");
    if (this.initialized) {
      const account: Account | null = this.msalService.instance.getActiveAccount();
      if (!account) {
        return false;
      }

      if (!account?.idTokenClaims?.roles) {
        this.alertService.AddDebugMessage(
          'Token does not have roles claim. Please ensure that your account is assigned to an app role and then sign-out and sign-in again.'
        );
        return false;
      } else if (!account.idTokenClaims.roles.includes(role)) {
        //        this.alertService.AddDebugMessage('You do not have access as expected role is missing. Please ensure that your account is assigned to an app role and then sign-out and sign-in again.');
        return false;
      }

      return true;
    }
    return false;
  }
}
