import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) { }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!this.authService.isAuthenticate()) {
      //      this.alertService.AddDebugMessage("Not logged in")
      return this.router.parseUrl('/');
    }

    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivateChild(_childRoute: ActivatedRouteSnapshot, _state: RouterStateSnapshot):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!this.authService.isAuthenticate()) {
      //      this.alertService.AddDebugMessage("Not logged in")
      return false;
    }

    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canLoad(_route: Route, _segments: UrlSegment[]):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!this.authService.isAuthenticate()) {
      //      this.alertService.AddDebugMessage("Not logged in")
      return this.router.parseUrl('/');
    }

    return true;
  }
}
