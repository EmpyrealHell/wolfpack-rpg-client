import { Type } from '@angular/core';
import { WidgetComponent } from '../../components/widget-factory/widget.component';

/**
 * Class used to pair widget components to id strings.
 */
export class WidgetItem {
  constructor(public component: Type<WidgetComponent>, public name: string) { }
}
