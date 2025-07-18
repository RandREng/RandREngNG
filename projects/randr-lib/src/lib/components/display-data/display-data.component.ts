import { Component, Input } from '@angular/core';

@Component({
  selector: 'r-display-data',
  templateUrl: './display-data.component.html',
  styleUrls: ['./display-data.component.scss'],
  standalone: true,
})
export class DisplayDataComponent {
  @Input() title!: string;
  @Input() data!: string;

}
