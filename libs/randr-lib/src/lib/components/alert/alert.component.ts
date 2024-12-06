import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { AlertService, alertItem } from '../../services/alert.service';

@Component({
    selector: 'lib-randr-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss'],
    imports: [ToastModule],
    providers: [MessageService]
})
export class AlertComponent {
  alerts: alertItem[] = [];

  constructor(
    private alertService: AlertService,
    private messageService: MessageService
  ) {
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
