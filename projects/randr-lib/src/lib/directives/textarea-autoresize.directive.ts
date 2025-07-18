import { Directive, HostListener, ElementRef, OnInit, inject } from '@angular/core';

@Directive({
  selector: 'textarea[rAutoResize]',
  standalone: true,
})
export class TextareaAutoResizeDirective implements OnInit {
  private elementRef = inject(ElementRef);


  @HostListener(':input')
  onInput() {
    this.resize();
  }

  ngOnInit() {
    if (this.elementRef.nativeElement.scrollHeight) {
      setTimeout(() => this.resize());
    }
  }

  resize() {
    this.elementRef.nativeElement.style.height = '0';
    this.elementRef.nativeElement.style.height =
      this.elementRef.nativeElement.scrollHeight + 'px';
  }
}
