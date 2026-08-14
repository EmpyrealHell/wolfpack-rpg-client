import { Directive, ViewContainerRef, inject } from '@angular/core';

/**
 * Directive that can be applied to provide access to the view container.
 */
@Directive({
  selector: '[appWidgetContainer]',
  standalone: false,
})
export class WidgetContainerDirective {  viewContainerRef = inject(ViewContainerRef);

}
