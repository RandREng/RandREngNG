import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { AlertService, alertItem } from '../../services/alert.service';

@Component({
  selector: 'r-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  imports: [ToastModule],
  providers: [MessageService]
})
export class AlertComponent {
  private alertService = inject(AlertService);
  private messageService = inject(MessageService);

  alerts: alertItem[] = [];

  constructor() {
    this.alertService.Alerts.pipe(takeUntilDestroyed()).subscribe((alert) => {
      this.alerts.push(alert);
      this.messageService.add({
        severity: alert.type == 'danger' ? 'error' : alert.type,
        detail: alert.message,
      });
      setTimeout(() => this.alerts.shift(), 5000);
    });
  }
}
