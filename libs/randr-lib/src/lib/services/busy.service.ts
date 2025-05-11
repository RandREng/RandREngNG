import { computed, Injectable, signal } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BusyService {
  public Busy = computed<boolean>(() => (this.count() > 0));

  private count = signal(0);

  public AddBusy() {
    this.count.update(value => value + 1);
  }

  public RemoveBusy() {
    this.count.update(value => value - 1);
  }
}
