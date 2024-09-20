import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Route,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';

import { MsalService } from '@azure/msal-angular';
import { AccountInfo } from '@azure/msal-browser';

import { AlertService } from 'randr-lib';

import { AuthService } from './auth.service';

interface Account extends AccountInfo {
  idTokenClaims?: {
    roles?: string[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class RoleGuard {
  constructor(private authService: AuthService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const expectedRoles = route.data['expectedRoles'];

    return this.authService.hasCommonRole(expectedRoles);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const expectedRoles = childRoute.data['expectedRoles'];

    return this.authService.hasCommonRole(expectedRoles);
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (route.data == undefined) {
      return false;
    }
    const expectedRoles = route.data['expectedRoles'];

    return this.authService.hasCommonRole(expectedRoles);
  }
}
