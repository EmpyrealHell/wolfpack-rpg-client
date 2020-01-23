import { ViewContainerRef, Directive } from '@angular/core';

@Directive({
  selector: '[appWidgetContainer]'
})
export class WidgetContainerDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
