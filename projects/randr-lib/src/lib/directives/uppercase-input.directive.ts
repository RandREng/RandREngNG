/* eslint-disable @typescript-eslint/no-explicit-any */
import { Directive, ElementRef, forwardRef, Renderer2, inject } from '@angular/core';
import { DefaultValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'input[rUppercase], textarea[rUppercase]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UppercaseDirective),
      multi: true,
    }
  ],
  standalone: true,
  host: {
    '(input)': 'onInput($event)'
  }
})
export class UppercaseDirective extends DefaultValueAccessor {
  constructor() {
    const renderer = inject(Renderer2);
    const elementRef = inject(ElementRef);

    super(renderer, elementRef, false);
  }

  override writeValue(value: any): void {
    const transformed = this.transformValue(value);

    super.writeValue(transformed);
  }

  onInput = (event: InputEvent) => {
    const input = event.target as HTMLInputElement;
    if (input) {
      const transformed = this.transformValue(input.value);

      super.writeValue(transformed);
      this.onChange(transformed);
    }
  };

  private transformValue(value: any): any {
    const result =
      value && typeof value === 'string' ? value.toUpperCase() : value;

    return result;
  }
}
