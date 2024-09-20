import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MsalBroadcastService,
  MsalGuard,
  MsalService,
} from '@azure/msal-angular';
import { TestInstanceFactory, TestGuardConfigFactory } from './test.factories';

import { LoginSubMenuComponent } from './login-sub-menu.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('MsalLibComponent', () => {
  let component: LoginSubMenuComponent;
  let fixture: ComponentFixture<LoginSubMenuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LoginSubMenuComponent],
      providers: [
        provideNoopAnimations(),
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
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginSubMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
