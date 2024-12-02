import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'lib-randr-loading',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss',
})
export class LoadingComponent {
  message = input<string>('Loading...');
}
