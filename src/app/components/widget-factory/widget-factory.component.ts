import {
  Component,
  ComponentFactory,
  Injector,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { WidgetContainerDirective } from 'src/app/directives/widget-container.directive';
import { WidgetComponent } from './widget.component';
import { CommandService } from 'src/app/services/command/command-service';
import { MatRipple } from '@angular/material/core';
import { EventSubService } from 'src/app/services/eventsub/eventsub.service';
import { AbstractWidgetComponent } from 'src/app/widgets/abstract/abstract-widget';
import { FishingWidgetComponent } from 'src/app/widgets/fishing/fishing.widget';
import { ConsoleWidgetComponent } from 'src/app/widgets/console/console.widget';

/**
 * Component that acts as a placeholder for widgets in the widget container.
 */
@Component({
  selector: 'app-widget-factory',
  template: '<ng-template appWidgetContainer></ng-template>',
  standalone: false,
})
export class WidgetFactoryComponent implements OnInit {
  /**
   * Component factory used to create the internal widget component.
   */
  @Input()
  factory: ComponentFactory<WidgetComponent> | undefined;

  /**
   * Reference to the EventSub service.
   */
  @Input()
  eventSubService: EventSubService | undefined;

  /**
   * Reference to the user config manager.
   */
  @Input()
  configManager: ConfigManager | undefined;

  /**
   * Reference to the command service.
   */
  @Input()
  commandService: CommandService | undefined;

  /**
   * The name of the component.
   */
  @Input()
  name: string | undefined;

  /**
   * Reference to the container in the dom that will house the internal widget.
   */
  @ViewChild(WidgetContainerDirective, { static: true })
  container: WidgetContainerDirective | undefined;

  constructor(public injector: Injector) {}

  ngOnInit(): void {
    if (this.factory && this.container) {
      const containerRef = this.container.viewContainerRef;
      containerRef.clear();
      const component = containerRef.createComponent(this.factory)
        .instance as WidgetComponent;
      component.configManager = this.configManager;
      component.eventSubService = this.eventSubService;
      component.commandService = this.commandService;
      component.name = this.name!;
      component.onActivate();
    }
  }
}
