import { ElementRef, OnInit, Directive } from '@angular/core';

@Directive({
    selector: '[appFocusOnLoad]',
    standalone: false
})
export class FocusOnLoadDirective implements OnInit {
  constructor(private elem: ElementRef) {}

  ngOnInit(): void {
    this.elem.nativeElement.focus();
  }
}
