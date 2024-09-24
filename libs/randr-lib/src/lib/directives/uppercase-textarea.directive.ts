/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Renderer2,
} from '@angular/core';
import {
  DefaultValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

const UPPERCASE_TEXTAREA_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => UppercaseTextareaDirective),
  multi: true,
};
@Directive({
  selector: 'textarea[libUppercase]',
  providers: [UPPERCASE_TEXTAREA_CONTROL_VALUE_ACCESSOR],
  standalone: true,
})
export class UppercaseTextareaDirective extends DefaultValueAccessor {
  constructor(renderer: Renderer2, elementRef: ElementRef) {
    super(renderer, elementRef, false);
  }

  override writeValue(value: any): void {
    const transformed = this.transformValue(value);

    super.writeValue(transformed);
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: any): void {
    const transformed = this.transformValue(value);

    super.writeValue(transformed);
    this.onChange(transformed);
  }

  private transformValue(value: any): any {
    const result =
      value && typeof value === 'string' ? value.toUpperCase() : value;

    return result;
  }
}
