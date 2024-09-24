import { TestBed } from '@angular/core/testing';

import { MSAL_GUARD_CONFIG, MSAL_INSTANCE, MsalBroadcastService, MsalGuard, MsalService } from '@azure/msal-angular';

import { TestInstanceFactory, TestGuardConfigFactory } from './test.factories';
import { AuthGuard } from './auth.guard';

describe('AuthGuardGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MsalService,
        MsalGuard,
        MsalBroadcastService,
        {
          provide: MSAL_INSTANCE,
          useFactory: TestInstanceFactory,
        },
        {
          provide: MSAL_GUARD_CONFIG,
          useFactory: TestGuardConfigFactory,
        },
      ]
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
