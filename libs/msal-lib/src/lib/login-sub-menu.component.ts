import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';

import { AuthService } from './auth.service';

@Component({
  selector: 'lib-msal-sub-menu',
  template: `
    <span>
      @if (authenticated) {
      <p-menu #menu [model]="itemsLogout" [popup]="true">
        <ng-template pTemplate="item" let-item>
          <a pRipple class="flex items-center p-menuitem-link">
            <span [class]="item.icon"></span>
            <span class="ml-2">{{ item.label }}</span>
            @if (item.badge){
            <p-badge class="ml-auto" [value]="item.badge" />
            } @if (item.shortcut) {
            <span
              class="ml-auto border border-surface rounded-border bg-surface-100 dark:bg-surface-700 text-xs p-1"
              >{{ item.shortcut }}</span
            >
            }
          </a>
        </ng-template>
        <ng-template pTemplate="end">
          <ng-content></ng-content>
        </ng-template>
      </p-menu>
      <p-button (click)="menu.toggle($event)">{{ userName }}</p-button>
      } @else {
      <p-menu #menu [model]="itemsLogin" />
      }
    </span>
  `,
  styles: [],
  standalone: true,
  imports: [BadgeModule, ButtonModule, MenuModule, RippleModule],
})
export class LoginSubMenuComponent {
  public isActive = true;
  public isAdmin = false;
  public authenticated = false;

  loginDisplay = false;

  //  private subscription: Subscription;
  public userName = '';
  badge = 0;

  itemsLogout: MenuItem[] = [
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => {
        this.logout();
      },
    },
  ];

  itemsLogin: MenuItem[] = [
    {
      label: 'Login',
      //        icon: 'pi pi-plus',
      command: () => {
        this.login();
      },
    },
  ];

  constructor(
    //    private router: Router,
    private authService: AuthService
  ) {
    this.authService.Authenticated$.pipe(takeUntilDestroyed()).subscribe(
      (result) => {
        this.authenticated = result;
        this.userName =
          this.authService.userName != undefined
            ? this.authService.userName
            : '';
      }
    );
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }

  menu() {
    this.isActive = !this.isActive;
  }
}
