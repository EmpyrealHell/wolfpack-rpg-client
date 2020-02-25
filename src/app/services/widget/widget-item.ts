import { Type } from '@angular/core';
import { WidgetComponent } from '../../components/widget-factory/widget.component';

/**
 * Class used to pair widget components to id strings.
 */
export class WidgetItem {
  constructor(public component: Type<WidgetComponent> | null, public name: string | null) { }

  /**
   * Gets the name of the icon file for this widget.
   */
  getIcon(): string {
    if (this.name) {
      const title = this.name.toLowerCase().replace(' ', '');
      return `widget-${title}.svg`;
    }
    return '';
  }
}
