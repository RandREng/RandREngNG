import { Injectable } from '@angular/core';
import { Subject, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BusyService {
  public Busy = new ReplaySubject<boolean>(12);
  count = 0;

  constructor() {}

  public AddBusy() {
    this.count++;
    if (this.count == 1) {
      this.Busy.next(true);
    }
  }

  public RemoveBusy() {
    this.count--;
    if (this.count == 0) {
      this.Busy.next(false);
    }
  }
}
