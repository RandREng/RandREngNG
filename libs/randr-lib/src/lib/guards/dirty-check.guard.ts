import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { IsDirty } from '../interfaces/is-dirty';

@Injectable({
  providedIn: 'root',
})
export class DirtyCheckGuard {
  canDeactivate(
    component: IsDirty,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _currentRoute: ActivatedRouteSnapshot,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _currentState: RouterStateSnapshot,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _nextState?: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!component.isDirty()) {
      return true;
    } else {
      return confirm('You have unsaved changes. Are you sure?');
    }
  }
}
