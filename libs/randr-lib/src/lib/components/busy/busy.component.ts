import { Component, OnInit } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { BusyService } from '../../services/busy.service';

@Component({
  selector: 'lib-randr-busy',
  templateUrl: './busy.component.html',
  styleUrls: ['./busy.component.scss'],
  standalone: true,
  imports: [ProgressBarModule],
})
export class BusyComponent implements OnInit {
  mode = 'determinate';
  value = 100;

  constructor(private busy: BusyService) {}

  ngOnInit(): void {
    this.busy.Busy.subscribe((value) => {
      this.mode = value ? 'indeterminate' : 'determinate';
    });
  }
}
