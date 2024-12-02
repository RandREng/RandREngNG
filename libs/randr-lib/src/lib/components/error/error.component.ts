import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'lib-randr-error',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    //    IconMo
  ],
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss',
})
export class ErrorComponent {
  errorMessage = input<string>('An error occurred. Please try again.');
  retry = output<void>();
}
