import { Observable } from 'rxjs';

export interface IsDirty {
  isDirty(): boolean | Observable<boolean>;
}
