import { Directive, ViewContainerRef } from '@angular/core';

/**
 * Directive that can be applied to provide access to the view container.
 */
@Directive({
    selector: '[appWidgetContainer]',
    standalone: false
})
export class WidgetContainerDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
