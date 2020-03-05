import { ComponentFactory, ComponentFactoryResolver, Type } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { MatCardModule, MatIconModule } from '@angular/material';
import { IrcService } from 'src/app/services/irc/irc.service';
import { WidgetItem } from 'src/app/services/widget/widget-item';
import { WidgetService } from 'src/app/services/widget/widget.service';
import { AbstractWidgetComponent } from 'src/app/widgets/abstract/abstract-widget';
import { Responder } from 'src/app/widgets/abstract/responder';
import { TestUtils } from 'src/test/test-utils';
import { ConfigManager } from '../../services/data/config-manager';
import { WidgetFactoryComponent } from '../widget-factory/widget-factory.component';
import { WidgetComponent } from '../widget-factory/widget.component';
import { WidgetContainerComponent } from './widget-container.component';

export class FirstWidget extends AbstractWidgetComponent {
  get loadCommands(): string[] { return []; }
  get responders(): Responder[] { return []; }
}
export class SecondWidget extends AbstractWidgetComponent {
  get loadCommands(): string[] { return []; }
  get responders(): Responder[] { return []; }
}

const firstWidgetItem = new WidgetItem(FirstWidget, 'First');
const secondwidgetItem = new WidgetItem(SecondWidget, 'Second');

const widgetServiceSpy = TestUtils.spyOnClass(WidgetService);
widgetServiceSpy.getWidgets.and.returnValue(new Array<WidgetItem>(firstWidgetItem, secondwidgetItem));
const configManagerSpy = TestUtils.spyOnClass(ConfigManager);
configManagerSpy.subscribe.and.callFake((delegate: () => void) => {
  delegate.call(delegate);
});
const ircServiceSpy = TestUtils.spyOnClass(IrcService);
const componentFactoryResolverSpy = jasmine.createSpyObj('ComponentFactoryResolver', ['resolveComponentFactory']);
componentFactoryResolverSpy.resolveComponentFactory.and.callFake((component: Type<WidgetComponent>) => {
  if (component === FirstWidget) {
    return { componentType: FirstWidget } as ComponentFactory<FirstWidget>;
  } else if (component === SecondWidget) {
    return { componentType: SecondWidget } as ComponentFactory<SecondWidget>;
  }
  return null;
});

describe('WidgetContainerComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatCardModule
      ],
      declarations: [
        WidgetContainerComponent,
        WidgetFactoryComponent
      ],
      providers: [
        { provide: WidgetService, useValue: widgetServiceSpy },
        { provide: ConfigManager, useValue: configManagerSpy },
        { provide: IrcService, useValue: ircServiceSpy },
        { provide: ComponentFactoryResolver, useValue: componentFactoryResolverSpy }
      ]
    }).compileComponents();
    configManagerSpy.getConfig.and.returnValue({
      Layout: ['First', 'Second']
    });
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
