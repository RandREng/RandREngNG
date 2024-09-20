import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHeaders,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AlertService } from './alert.service';
import { BusyService } from './busy.service';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  httpClient: HttpClient | null;
  alertService: AlertService | null;
  busyService: BusyService | null;

  constructor() {
    this.httpClient = inject(HttpClient);
    this.alertService = inject(AlertService);
    this.busyService = inject(BusyService);
  }

  protected _get<T>(requestUrl: string): Observable<T> {
    this.busyService!.AddBusy();

    return this.httpClient!.get<T>(requestUrl).pipe(
      catchError((err) => this.handleError(err)),
      finalize(() => this.busyService!.RemoveBusy())
    );
  }

  protected _put<T, U>(requestUrl: string, item: U): Observable<T> {
    this.busyService?.AddBusy();

    return this.httpClient!.put<T>(requestUrl, item, this.httpOptions).pipe(
      catchError((err) => this.handleError(err)),
      finalize(() => this.busyService!.RemoveBusy())
    );
  }

  protected _post<T, U>(requestUrl: string, item: U): Observable<T> {
    this.busyService!.AddBusy();

    return this.httpClient!.post<T>(requestUrl, item, this.httpOptions).pipe(
      catchError((err) => this.handleError(err)),
      finalize(() => this.busyService!.RemoveBusy())
    );
  }

  protected _delete<T>(requestUrl: string): Observable<any> {
    this.busyService!.AddBusy();

    return this.httpClient!.delete(requestUrl).pipe(
      catchError((err) => this.handleError(err)),
      finalize(() => this.busyService!.RemoveBusy())
    );
  }

  protected handleError(error: HttpErrorResponse): Observable<never> {
    //    this.busyService.RemoveBusy();
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      this.alertService!.AddErrorMessage(
        `An error occurred:, ${error.error.message}`
      );
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      this.alertService!.AddErrorMessage(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    // return an observable with a user-facing error message
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }

  public _upload(url: string, files: File[]): Observable<HttpEvent<string[]>> {
    const formData = new FormData();

    let index: number = 0;

    while (index < files.length) {
      formData.append('files', files[index], files[index].name);
      index++;
    }

    return this.httpClient!.post<string[]>(url, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }
}
