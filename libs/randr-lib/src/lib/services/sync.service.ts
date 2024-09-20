import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  catchError,
  concat,
  EMPTY,
  map,
  Observable,
  retry,
  share,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';
import { Payload } from '../models/payload.model';
import { SyncTask } from '../models/sync-task.model';

const HTTP_TIMEOUT_IN_MS = 5000;
const STORAGE_KEY = 'syncTasks';

@Injectable({ providedIn: 'root' })
export class SyncService {
  constructor(private http: HttpClient) {}

  tryPostPayload<T extends Payload>(
    url: string,
    payload: T,
    params: HttpParams
  ): Observable<T> {
    return this.http.post<T>(url, payload, { params }).pipe(
      timeout(HTTP_TIMEOUT_IN_MS),
      retry(2),
      catchError((err: HttpErrorResponse) => this.handleError(err)),
      share()
    );
  }

  private handleError(err: HttpErrorResponse): Observable<any> {
    if (this.offlineOrBadConnection(err)) {
      // A client-side or network error occurred. Handle it accordingly.

      // TODO: add call to queue to retry at a later time

      return EMPTY;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      return throwError(err);
    }
  }

  private offlineOrBadConnection(err: HttpErrorResponse): boolean {
    return (
      err instanceof TimeoutError ||
      err.error instanceof ErrorEvent ||
      !this.connectionService.isOnLine() // A helper service that delegates to window.navigator.onLine
    );
  }

  private addOrUpdateSyncTask<T>(
    url: string,
    payload: T,
    params: HttpParams
  ): void {
    const tasks = this.getExistingSyncTasks();

    const syncTask = new SyncTask(url, payload, params.toString());
    tasks.push(syncTask);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  private getExistingSyncTasks(): SyncTask[] {
    const serializedTasks = localStorage.getItem(STORAGE_KEY);

    return serializedTasks ? JSON.parse(serializedTasks) : [];
  }

  sync(): Observable<any> {
    const syncTasks = this.getExistingSyncTasks();
    const requests: Observable<any>[] = [];

    syncTasks.forEach((task: SyncTask<Payload>) => {
      const params = { params: new HttpParams({ fromString: task.params }) };
      const obs$ = this.http
        .post(task.url, task.body, params)
        .pipe(map((_) => task));

      requests.push(obs$);
    });

    const all$ = concat(...requests).pipe(share());

    all$.subscribe((task) => {
      const index = syncTasks.findIndex((t) => t.equals(task));
      syncTasks.splice(index, 1);
      this._syncTasks.next(syncTasks);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    });

    return all$;
  }
}
