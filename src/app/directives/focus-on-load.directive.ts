import { Directive, ElementRef, OnInit, inject } from '@angular/core';

@Directive({ selector: '[appFocusOnLoad]', })
export class FocusOnLoadDirective implements OnInit {
  private elem = inject(ElementRef);


  ngOnInit(): void {
    this.elem.nativeElement.focus();
  }
}
