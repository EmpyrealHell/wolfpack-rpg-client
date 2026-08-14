import { Directive, ElementRef, OnInit, inject } from '@angular/core';
import { NgModel } from '@angular/forms';

/**
 * Directive that can be applied to a scrollable area to automatically scroll
 * to the bottom when the model updates.
 */
@Directive({ selector: '[appShowLast]', })
export class ShowLastDirective implements OnInit {
  private elem = inject(ElementRef);
  private model = inject(NgModel);


  ngOnInit(): void {
    if (this.model && this.model.valueChanges) {
      this.model.valueChanges.subscribe(() => {
        this.elem.nativeElement.scrollTop =
          this.elem.nativeElement.scrollHeight;
      });
    }
  }
}
