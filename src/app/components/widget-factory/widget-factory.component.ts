import {
  Component,
  ComponentFactory,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { WidgetContainerDirective } from 'src/app/directives/widget-container.directive';
import { IrcService } from 'src/app/services/irc/irc.service';
import { WidgetComponent } from './widget.component';
import { CommandService } from 'src/app/services/command/command-service';

/**
 * Component that acts as a placeholder for widgets in the widget container.
 */
@Component({
  selector: 'app-widget-factory',
  template: '<ng-template appWidgetContainer></ng-template>',
})
export class WidgetFactoryComponent implements OnInit {
  /**
   * Component factory used to create the internal widget component.
   */
  @Input()
  factory: ComponentFactory<WidgetComponent> | null = null;

  /**
   * Reference to the singleton IRC service.
   */
  @Input()
  ircService: IrcService | null = null;

  /**
   * Reference to the user config manager.
   */
  @Input()
  configManager: ConfigManager | null = null;

  /**
   * Reference to the command service.
   */
  @Input()
  commandService: CommandService | null = null;

  /**
   * The name of the component.
   */
  @Input()
  name: string | null = null;

  /**
   * Reference to the container in the dom that will house the internal widget.
   */
  @ViewChild(WidgetContainerDirective, { static: true })
  container: WidgetContainerDirective | null = null;

  constructor() {}

  ngOnInit(): void {
    if (this.factory && this.container) {
      const containerRef = this.container.viewContainerRef;
      containerRef.clear();
      const component = containerRef.createComponent(this.factory)
        .instance as WidgetComponent;
      component.configManager = this.configManager;
      component.ircService = this.ircService;
      component.commandService = this.commandService;
      component.name = this.name!;
      component.onActivate();
    }
  }
}
