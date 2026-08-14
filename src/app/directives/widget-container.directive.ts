import { Directive, ViewContainerRef, inject } from '@angular/core';

/**
 * Directive that can be applied to provide access to the view container.
 */
@Directive({ selector: '[appWidgetContainer]', })
export class WidgetContainerDirective {  viewContainerRef = inject(ViewContainerRef);

}
