import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Route,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard {
  constructor(private authService: AuthService) { }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const expectedRoles = route.data['expectedRoles'];

    return this.authService.hasCommonRole(expectedRoles);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivateChild(childRoute: ActivatedRouteSnapshot, _state: RouterStateSnapshot):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const expectedRoles = childRoute.data['expectedRoles'];

    return this.authService.hasCommonRole(expectedRoles);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canLoad(route: Route, _segments: UrlSegment[]):
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
