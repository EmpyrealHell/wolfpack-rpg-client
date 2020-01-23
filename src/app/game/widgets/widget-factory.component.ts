import { Input, ComponentFactory, OnInit, ViewChild, Component } from '@angular/core';
import { WidgetComponent } from './widget.component';
import { IrcService } from 'src/app/irc/irc.service';
import { ConfigManager } from 'src/app/data/config-manager';
import { WidgetContainerDirective } from 'src/app/directives/widget-container.directive';

@Component({
  selector: 'app-widget-factory',
  template: '<ng-container appWidgetContainer></ng-container>'
})
export class WidgetFactoryComponent implements OnInit {
  @Input() factory: ComponentFactory<WidgetComponent>;
  @Input() ircService: IrcService;
  @Input() configManager: ConfigManager;

  @ViewChild(WidgetContainerDirective, { static: true }) container: WidgetContainerDirective;

  constructor() { }

  public ngOnInit(): void {
    if (this.factory && this.container) {
      const containerRef = this.container.viewContainerRef;
      containerRef.clear();
      const component = containerRef.createComponent(this.factory).instance as WidgetComponent;
      component.configManager = this.configManager;
      component.ircService = this.ircService;
    }
  }
}
