import {
  ComponentFactory,
  ComponentFactoryResolver,
  Type,
} from '@angular/core';
import { waitForAsync, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { WidgetItem } from 'src/app/services/widget/widget-item';
import { AbstractWidgetComponent } from 'src/app/widgets/abstract/abstract-widget';
import { TestUtils } from 'src/test/test-utils';
import { ConfigManager } from '../../services/data/config-manager';
import { WidgetFactoryComponent } from '../widget-factory/widget-factory.component';
import { WidgetComponent } from '../widget-factory/widget.component';
import { WidgetContainerComponent } from './widget-container.component';
import { Config } from 'src/app/services/data/config-data';
import { CommandService } from 'src/app/services/command/command-service';
import { EventSubService } from 'src/app/services/eventsub/eventsub.service';
import { ClientDataService } from 'src/app/services/client-data/client-data-service';
import { WidgetService } from 'src/app/services/widget/widget.service';

export class FirstWidget extends AbstractWidgetComponent {
  protected subscribeToResponses(
    id: string,
    commandService: CommandService
  ): void {}
  protected sendInitialCommands(commandService: CommandService): void {}
}
export class SecondWidget extends AbstractWidgetComponent {
  protected subscribeToResponses(
    id: string,
    commandService: CommandService
  ): void {}
  protected sendInitialCommands(commandService: CommandService): void {}
}

const firstWidgetItem = new WidgetItem(FirstWidget, 'First', 'First', 'first');
const secondwidgetItem = new WidgetItem(
  SecondWidget,
  'Second',
  'Second',
  'second'
);

const clientDataServiceSpy = TestUtils.spyOnClass(ClientDataService);
const widgetServiceSpy = TestUtils.spyOnClass(WidgetService);
widgetServiceSpy.getWidgets.and.returnValue(
  new Array<WidgetItem>(firstWidgetItem, secondwidgetItem)
);
const configManagerSpy = TestUtils.spyOnClass(ConfigManager);
configManagerSpy.subscribe.and.callFake((delegate: () => void) => {
  delegate.call(delegate);
});
const eventSubServiceSpy = TestUtils.spyOnClass(EventSubService);
const componentFactoryResolverSpy = jasmine.createSpyObj(
  'ComponentFactoryResolver',
  ['resolveComponentFactory']
);
componentFactoryResolverSpy.resolveComponentFactory.and.callFake(
  (component: Type<WidgetComponent>) => {
    if (component === FirstWidget) {
      return { componentType: FirstWidget } as ComponentFactory<FirstWidget>;
    } else if (component === SecondWidget) {
      return { componentType: SecondWidget } as ComponentFactory<SecondWidget>;
    }
    return null;
  }
);
const commandServiceSpy = TestUtils.spyOnClass(CommandService);

describe('WidgetContainerComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatIconModule, MatCardModule],
      declarations: [WidgetContainerComponent, WidgetFactoryComponent],
      providers: [
        {
          provide: ClientDataService,
          useValue: clientDataServiceSpy,
        },
        {
          provide: WidgetService,
          useValue: widgetServiceSpy,
        },
        { provide: ConfigManager, useValue: configManagerSpy },
        { provide: CommandService, useValue: commandServiceSpy },
        { provide: EventSubService, useValue: eventSubServiceSpy },
        {
          provide: ComponentFactoryResolver,
          useValue: componentFactoryResolverSpy,
        },
      ],
    }).compileComponents();
    configManagerSpy.getConfig.and.returnValue({
      layout: ['First', 'Second'],
    } as Partial<Config>);
  }));

  it('should update layout on config update', () => {
    const fixture = TestBed.createComponent(WidgetContainerComponent);
    const layoutSpy = spyOn(fixture.componentInstance, 'resetLayout');

    fixture.componentInstance.ngOnInit();
    expect(configManagerSpy.getConfig).toHaveBeenCalled();
    expect(configManagerSpy.subscribe).toHaveBeenCalled();
    expect(layoutSpy).toHaveBeenCalledTimes(2);
  });

  it('should close widgets', () => {
    const fixture = TestBed.createComponent(WidgetContainerComponent);

    fixture.componentInstance.ngOnInit();
    fixture.componentInstance.closeWidget(0);
    expect(fixture.componentInstance.config).toBeTruthy();
    expect(fixture.componentInstance.config!.layout).not.toContain('First');
    expect(fixture.componentInstance.config!.layout).toContain('Second');
    expect(configManagerSpy.save).toHaveBeenCalled();
  });

  it('should get widget icons', () => {
    const fixture = TestBed.createComponent(WidgetContainerComponent);

    fixture.componentInstance.ngOnInit();
    const icon = fixture.componentInstance.getWidgetIcon(0);
    expect(icon).toEqual(firstWidgetItem.getIcon());
  });

  it('creates widgets for the layout', () => {
    const fixture = TestBed.createComponent(WidgetContainerComponent);

    fixture.componentInstance.ngOnInit();
    fixture.componentInstance.resetLayout();
    const factories = fixture.componentInstance.factories;
    expect(factories.length).toBe(2);
    expect(factories[0].componentType).toBe(FirstWidget);
    expect(factories[1].componentType).toBe(SecondWidget);
    expect(fixture.componentInstance.gridlayout).toBe('"a0 a1"');
  });
});
