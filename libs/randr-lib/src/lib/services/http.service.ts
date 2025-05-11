import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHeaders,
  httpResource,
} from '@angular/common/http';
import { computed, effect, inject, Injectable, Signal, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AlertService } from './alert.service';
import { BusyService } from './busy.service';
import { Page } from '../models/page.model';
import { TableLazyLoadEvent } from 'primeng/table';

@Injectable()
export abstract class HttpService {
  readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  httpClient = inject(HttpClient);
  alertService = inject(AlertService);
  busyService = inject(BusyService);

  protected _get<T>(requestUrl: string): Observable<T> {
    this.busyService.AddBusy();

    return this.httpClient?.get<T>(requestUrl).pipe(
      catchError((err) => this.handleError(err)),
      finalize(() => this.busyService.RemoveBusy())
    );
  }

  protected _put<T, U>(requestUrl: string, item: U): Observable<T> {
    this.busyService?.AddBusy();

    return this.httpClient.put<T>(requestUrl, item, this.httpOptions).pipe(
      catchError((err) => this.handleError(err)),
      finalize(() => this.busyService.RemoveBusy())
    );
  }

  protected _post<T, U>(requestUrl: string, item: U): Observable<T> {
    this.busyService.AddBusy();

    return this.httpClient.post<T>(requestUrl, item, this.httpOptions).pipe(
      catchError((err) => this.handleError(err)),
      finalize(() => this.busyService.RemoveBusy())
    );
  }

  protected _delete(requestUrl: string): Observable<object> {
    this.busyService.AddBusy();

    return this.httpClient.delete(requestUrl).pipe(
      catchError((err) => this.handleError(err)),
      finalize(() => this.busyService.RemoveBusy())
    );
  }


  protected handleErrorSignal(error: HttpErrorResponse) {
    if (error) {
      if (error.error instanceof ErrorEvent) {
        // A client-side or network error occurred. Handle it accordingly.
        this.alertService.AddErrorMessage(
          `An error occurred:, ${error.error.message}`,
        );
      } else {
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong,
        this.alertService.AddErrorMessage(
          `Backend returned code ${error.status}, ` +
          `body was: ${error.error}`,
        );
      }
    }
  }

  protected handleError(error: HttpErrorResponse): Observable<never> {
    //    this.busyService.RemoveBusy();
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      this.alertService.AddErrorMessage(
        `An error occurred:, ${error.error.message}`
      );
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      this.alertService.AddErrorMessage(
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

    let index = 0;

    while (index < files.length) {
      formData.append('files', files[index], files[index].name);
      index++;
    }

    return this.httpClient.post<string[]>(url, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }
}

export abstract class HttpPageService<T> extends HttpService {
  abstract href: string;
  public pageNumber = signal<number>(1);
  public pageSize = signal<number>(10);
  public sortColumn = signal<string | undefined>("");
  public sortDirection = signal<string | undefined>("");
  public id = signal<number | undefined>(undefined);

  protected abstract filter: Signal<string>;

  private dataResource = httpResource<Page<T>>(() => ({
    url: this.href,
    method: 'GET',
    headers: {
      accept: 'application/json',
    },
    params: {
      pageSize: this.pageSize(),
      page: this.pageNumber() + 1,
      sortColumn: this.sortColumn() ?? '',
      sortDirection: this.sortDirection() ?? '',
      filter: this.filter(),
    },
  }));

  data = computed(() => this.dataResource.value()?.results ?? [] as T[]);
  error = computed(() => this.dataResource.error() as HttpErrorResponse);
  totalRecords = computed(() => this.dataResource.value()?.rowCount ?? 0)
  //   errorMessage = computed(() => setErrorMessage(this.error(), 'Vehicle'));
  isLoading = this.dataResource.isLoading;

  constructor() {
    super();
    effect(() => {
      this.handleErrorSignal(this.error());
    });
    effect(() => {
      if (this.isLoading()) {
        this.busyService.AddBusy();
      }
      else if (!this.isLoading()) {
        this.busyService.RemoveBusy()
      }
    });
  }


  public loadData(event: TableLazyLoadEvent) {
    if (event.first != undefined && event.rows != undefined) {
      this.pageNumber.set(event.first / event.rows);
      this.pageSize.set(event.rows);
    };

    if (event.sortField && event.sortOrder) {
      this.sortColumn.set(event.sortField as string);
      this.sortDirection.set(event.sortOrder == 1 ? 'asc' : 'desc');
    }
  }

  // get(id: string): Observable<T> {
  //   const requestUrl = `${this.href}/${id}`;

  //   return this._get<T>(requestUrl);
  // }
}
