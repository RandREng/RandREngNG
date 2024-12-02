import { Component, ContentChild, effect, inject, input, output, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ErrorComponent } from '../error/error.component';
import { LoadingComponent } from '../loading/loading.component';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'lib-randr-page',
  standalone: true,
  imports: [CommonModule, ErrorComponent, LoadingComponent],
  templateUrl: './page.component.html',
  styleUrl: './page.component.scss',
})
export class PageComponent {
  @ContentChild('loadingTemplate', { static: false }) loadingTemplate?: TemplateRef<unknown>;
  @ContentChild('errorTemplate', { static: false }) errorTemplate?: TemplateRef<unknown>;

  error = input<Error | null>(null);
  isLoading = input<boolean>(false);
  title = input<string>('');
  retry = output<void>();

  private layoutService = inject(LayoutService);

  constructor() {
    effect(
      () => {
        this.layoutService.setPageTitle(this.title());
      },
      { allowSignalWrites: true }
    );
  }
}
