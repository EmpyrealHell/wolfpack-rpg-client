import {
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  OnInit,
} from '@angular/core';
import { Config } from 'src/app/services/data/config-data';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { WidgetItem } from '../../services/widget/widget-item';
import { WidgetComponent } from '../widget-factory/widget.component';
import { CommandService } from 'src/app/services/command/command-service';
import { ClientDataService } from 'src/app/services/client-data/client-data-service';
import { EventSubService } from 'src/app/services/eventsub/eventsub.service';
import { WidgetService } from 'src/app/services/widget/widget.service';
import { AudioPlayerService } from 'src/app/services/audio-player/audio-player-service';

/**
 * Holds a list of widgets and renders them to the DOM, in order.
 */
@Component({
  selector: 'app-widget-container',
  templateUrl: './widget-container.component.html',
  standalone: false,
})
export class WidgetContainerComponent implements OnInit {
  private static layouts = [
    '',
    '"a0"',
    '"a0 a1"',
    '"a0 a1" "a0 a2"',
    '"a0 a1" "a2 a3"',
    '"a0 a1 a2" "a0 a3 a4"',
    '"a0 a1 a2" "a3 a4 a5"',
    '"a0 a1 a2" "a0 a1 a3" "a4 a5 a6"',
    '"a0 a1 a2" "a0 a3 a4" "a5 a6 a7"',
    '"a0 a1 a2" "a3 a4 a5" "a6 a7 a8"',
  ];

  private widgetMap: Map<string, WidgetItem> = new Map<string, WidgetItem>();
  /**
   * User's config, which contains widget layout data.
   */
  config: Config | null = null;
  /**
   * Grid template area string used to arrange the widgets.
   */
  gridlayout = '';
  /**
   * List of factories used to create and attach the widgets.
   */
  factories = new Array<ComponentFactory<WidgetComponent>>();

  constructor(
    private widgetService: WidgetService,
    public audioPlayerService: AudioPlayerService,
    public clientDataService: ClientDataService,
    public configManager: ConfigManager,
    public eventSubService: EventSubService,
    public commandService: CommandService,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  ngOnInit(): void {
    this.config = this.configManager.getConfig();
    this.configManager.subscribe(() => {
      this.resetLayout();
    });
    this.resetLayout();
  }

  /**
   * Removes a widget from the container.
   * @param index The index of the widget to close.
   */
  closeWidget(index: number): void {
    if (this.config) {
      this.config.layout.splice(index, 1);
      this.configManager.save();
    }
  }

  /**
   * Returns the name of the icon file to use for the widget at an index.
   * @param index Gets the name of to the icon file for a widget.
   */
  getWidgetIcon(index: number): string {
    const id = this.config ? this.config.layout[index] : '';
    const widget = this.widgetMap.get(id);
    return widget ? widget.getIcon() : '';
  }

  /**
   * Reloads the list of widgets that should be hosted in the container from
   * the user's config.
   */
  resetLayout(): void {
    if (this.widgetMap.size === 0) {
      const widgets = this.widgetService.getWidgets();
      for (const widget of widgets) {
        if (widget && widget.component && widget.id) {
          this.widgetMap.set(widget.id, widget);
        }
      }
    }

    this.factories = [];
    if (this.config) {
      const items = this.config.layout ? this.config.layout : [];
      for (const item of items) {
        const widget = this.loadWidget(item);
        if (widget) {
          this.factories.push(widget);
        }
      }
    }
    this.gridlayout = WidgetContainerComponent.layouts[this.factories.length];
  }

  /**
   * Gets the id of a widget in the layout by index.
   * @param index The index of the widget.
   */
  getWidgetName(index: number): string {
    if (this.config && this.config.layout) {
      return this.widgetMap.get(this.config.layout[index])?.name ?? '';
    }
    return '';
  }

  private loadWidget(id: string): ComponentFactory<WidgetComponent> | null {
    const widget = this.widgetMap.get(id);
    if (widget) {
      const widgetComponent = widget.component;
      if (widgetComponent) {
        const factory =
          this.componentFactoryResolver.resolveComponentFactory(
            widgetComponent
          );
        return factory;
      }
    }
    return null;
  }
}
