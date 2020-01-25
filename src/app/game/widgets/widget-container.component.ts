import { Component, ComponentFactory, ComponentFactoryResolver, OnInit } from '@angular/core';
import { Config } from 'src/app/data/config-data';
import { ConfigManager } from 'src/app/data/config-manager';
import { IrcService } from 'src/app/irc/irc.service';
import { WidgetItem } from './widget-item';
import { WidgetComponent } from './widget.component';
import { WidgetService } from './widget.service';

/**
 * Holds a list of widgets and renders them to the DOM, in order.
 */
@Component({
  selector: 'app-widget-container',
  templateUrl: './widget-container.component.html'
})
export class WidgetContainerComponent implements OnInit {

  private widgetMap: Map<string, WidgetItem> = new Map<string, WidgetItem>();
  private config: Config;

  private layouts = [
    '', '"a0"', '"a0 a1"', '"a0 a1" "a0 a2"',
    '"a0 a1" "a2 a3"', '"a0 a1 a2" "a0 a3 a4"',
    '"a0 a1 a2" "a3 a4 a5"', '"a0 a1 a2" "a0 a1 a3" "a4 a5 a6"',
    '"a0 a1 a2" "a0 a3 a4" "a5 a6 a7"', '"a0 a1 a2" "a3 a4 a5" "a6 a7 a8"'
  ];

  /**
   * Grid template area string used to arrange the widgets.
   */
  public gridlayout: string;
  /**
   * List of factories used to create and attach the widgets.
   */
  public factories = new Array<ComponentFactory<WidgetComponent>>();

  constructor(private widgetService: WidgetService, private configManager: ConfigManager,
    // tslint:disable-next-line:align
    private ircService: IrcService, private componentFactoryResolver: ComponentFactoryResolver) { }

  public ngOnInit() {
    this.config = this.configManager.GetConfig();
    this.configManager.Subscribe(() => { this.resetLayout(); });
    this.resetLayout();
  }

  /**
   * Reloads the list of widgets that should be hosted in the container from
   * the user's config.
   */
  public resetLayout() {
    if (this.widgetMap.size === 0) {
      const widgets = this.widgetService.getWidgets();
      for (const widget of widgets) {
        this.widgetMap.set(widget.name, widget);
      }
    }

    this.factories = [];
    const items = this.config.Layout;
    for (const item of items) {
      this.factories.push(this.loadWidget(item));
    }
    this.gridlayout = this.layouts[this.factories.length];
  }

  private loadWidget(name: string): ComponentFactory<WidgetComponent> {
    if (this.widgetMap.has(name)) {
      const widget = this.widgetMap.get(name).component;
      const factory = this.componentFactoryResolver.resolveComponentFactory(widget);
      return factory;
    }
    return null;
  }
}
