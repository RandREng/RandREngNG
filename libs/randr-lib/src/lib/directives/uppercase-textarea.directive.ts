/* eslint-disable @typescript-eslint/no-explicit-any */
import { Directive, ElementRef, forwardRef, Renderer2 } from '@angular/core';
import { DefaultValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'textarea[randrUppercase]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UppercaseTextareaDirective),
      multi: true,
    }
  ],
  standalone: true,
  host: {
    '(input)': 'onInput($event)',
  }
})
export class UppercaseTextareaDirective extends DefaultValueAccessor {
  constructor(renderer: Renderer2, elementRef: ElementRef) {
    super(renderer, elementRef, false);
  }

  override writeValue(value: any): void {
    const transformed = this.transformValue(value);

    super.writeValue(transformed);
  }


  onInput(event: InputEvent): void {
    const input = event.target as HTMLTextAreaElement;
    if (input) {
      const transformed = this.transformValue(input.value);

      super.writeValue(transformed);
      this.onChange(transformed);
    }
  }

  private transformValue(value: any): any {
    const result =
      value && typeof value === 'string' ? value.toUpperCase() : value;

    return result;
  }
}
