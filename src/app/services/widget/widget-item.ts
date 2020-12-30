import { Type } from '@angular/core';
import { WidgetComponent } from '../../components/widget-factory/widget.component';

/**
 * Class used to pair widget components to id strings.
 */
export class WidgetItem {
  constructor(
    public component: Type<WidgetComponent> | null,
    public name: string,
    public id: string,
    public icon: string
  ) {}

  /**
   * Gets the name of the icon file for this widget.
   */
  getIcon(): string {
    return `widget-${this.icon}.svg`;
  }
}
