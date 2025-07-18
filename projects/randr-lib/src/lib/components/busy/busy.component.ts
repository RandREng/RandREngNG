import { Component, computed, inject } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { BusyService } from '../../services/busy.service';

@Component({
  selector: 'r-busy',
  templateUrl: './busy.component.html',
  styleUrls: ['./busy.component.scss'],
  imports: [ProgressBarModule]
})
export class BusyComponent {
  value = 100;

  busyService = inject(BusyService);
  busy = this.busyService.Busy
  mode = computed<string>(() => (this.busy() ? 'indeterminate' : 'determinate'));

}
