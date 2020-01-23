import { Component, OnInit, ViewChild, ComponentFactoryResolver, ViewContainerRef, ComponentFactory } from '@angular/core';
import { WidgetService } from './widget.service';
import { WidgetComponent } from './widget.component';
import { ConfigManager } from 'src/app/data/config-manager';
import { Config } from 'src/app/data/config-data';
import { WidgetContainerDirective } from 'src/app/directives/widget-container.directive';
import { WidgetItem } from './widget-item';
import { IrcService } from 'src/app/irc/irc.service';

@Component({
  selector: 'app-widget-container',
  templateUrl: './widget-container.component.html'
})
export class WidgetContainerComponent implements OnInit {

  private widgetMap: Map<string, WidgetItem> = new Map<string, WidgetItem>();
  private widgets = new Array<string>('Console', 'Character');
  private config: Config;

  public factories = new Array<ComponentFactory<WidgetComponent>>();



  @ViewChild(WidgetContainerDirective, { static: true }) container: WidgetContainerDirective;

  constructor(private widgetService: WidgetService, private configManager: ConfigManager,
    // tslint:disable-next-line:align
    private ircService: IrcService, private componentFactoryResolver: ComponentFactoryResolver) { }

  public ngOnInit() {
    this.config = this.configManager.GetConfig();

    this.widgetMap.clear();
    const widgets = this.widgetService.getWidgets();
    for (const widget of widgets) {
      this.widgetMap.set(widget.name, widget);
    }

    const containerRef = this.container.viewContainerRef;
    containerRef.clear();

    // const items = this.config.Layout;
    for (const item of this.widgets) {
      this.factories.push(this.loadWidget(item));
    }
  }

  public getColSpan(): number {
    switch (this.factories.length) {
      case 1: case 2:
        return 12;
      case 3: case 4: case 5: case 6:
        return 6;
      default:
        return 4;
    }
  }

  public getRowSpan(): number {
    switch (this.factories.length) {
      case 1:
        return 12;
      case 2: case 3: case 4:
        return 6;
      default:
        return 4;
    }
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
