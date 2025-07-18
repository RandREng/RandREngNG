import { Injectable, inject } from '@angular/core';
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
  private authService = inject(AuthService);

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const expectedRoles = route.data['expectedRoles'];

    return this.authService.hasCommonRole(expectedRoles);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, _state: RouterStateSnapshot):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const expectedRoles = childRoute.data['expectedRoles'];

    return this.authService.hasCommonRole(expectedRoles);
  }

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
