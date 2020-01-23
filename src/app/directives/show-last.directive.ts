import { Directive, ElementRef, HostListener, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
  selector: '[appShowLast]',
  providers: [NgModel]
})
export class ShowLastDirective implements OnInit {
  constructor(private elem: ElementRef, private model: NgModel) { }

  public ngOnInit() {
    this.model.valueChanges.subscribe((event) => {
      this.elem.nativeElement.scrollTop = this.elem.nativeElement.scrollHeight;
    });
  }
}
