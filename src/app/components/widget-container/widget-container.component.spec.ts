import { TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { WidgetItem } from 'src/app/services/widget/widget-item';
import { AbstractWidgetComponent } from 'src/app/widgets/abstract/abstract-widget';
import { TestUtils } from 'src/test/test-utils';
import { ConfigManager } from '../../services/data/config-manager';
import { WidgetFactoryComponent } from '../widget-factory/widget-factory.component';
import { WidgetContainerComponent } from './widget-container.component';
import { Config } from 'src/app/services/data/config-data';
import { CommandService } from 'src/app/services/command/command-service';
import { EventSubService } from 'src/app/services/eventsub/eventsub.service';
import { ClientDataService } from 'src/app/services/client-data/client-data-service';
import { WidgetService } from 'src/app/services/widget/widget.service';

export class FirstWidget extends AbstractWidgetComponent {
  protected subscribeToResponses(
    _id: string,
    _commandService: CommandService
  ): void {}
  protected sendInitialCommands(_commandService: CommandService): void {}
}
export class SecondWidget extends AbstractWidgetComponent {
  protected subscribeToResponses(
    _id: string,
    _commandService: CommandService
  ): void {}
  protected sendInitialCommands(_commandService: CommandService): void {}
}

const firstWidgetItem = new WidgetItem(FirstWidget, 'First', 'First', 'first'),
  secondwidgetItem = new WidgetItem(SecondWidget, 'Second', 'Second', 'second'),
  clientDataServiceSpy = TestUtils.spyOnClass(ClientDataService),
  widgetServiceSpy = TestUtils.spyOnClass(WidgetService);
widgetServiceSpy.getWidgets.and.returnValue(
  new Array<WidgetItem>(firstWidgetItem, secondwidgetItem)
);
const configManagerSpy = TestUtils.spyOnClass(ConfigManager);
configManagerSpy.subscribe.and.callFake((delegate: () => void) => {
  delegate.call(delegate);
});
const eventSubServiceSpy = TestUtils.spyOnClass(EventSubService);
const commandServiceSpy = TestUtils.spyOnClass(CommandService);

describe('WidgetContainerComponent', () => {
  beforeEach(waitForAsync(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatCardModule,
        WidgetContainerComponent,
        WidgetFactoryComponent,
      ],
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
      ],
    }).compileComponents();
    configManagerSpy.getConfig.and.returnValue({
      layout: ['First', 'Second'],
    } as Partial<Config>);
  }));

  it('should update layout on config update', async () => {
    const fixture = TestBed.createComponent(WidgetContainerComponent),
      layoutSpy = spyOn(fixture.componentInstance, 'resetLayout');

    fixture.componentInstance.ngOnInit();
    await expect(configManagerSpy.getConfig).toHaveBeenCalled();
    await expect(configManagerSpy.subscribe).toHaveBeenCalled();
    await expect(layoutSpy).toHaveBeenCalledTimes(2);
  });

  it('should close widgets', async () => {
    const fixture = TestBed.createComponent(WidgetContainerComponent);

    fixture.componentInstance.ngOnInit();
    fixture.componentInstance.closeWidget(0);
    await expect(fixture.componentInstance.config).toBeTruthy();
    await expect(fixture.componentInstance.config!.layout).not.toContain(
      'First'
    );
    await expect(fixture.componentInstance.config!.layout).toContain('Second');
    await expect(configManagerSpy.save).toHaveBeenCalled();
  });

  it('should get widget icons', async () => {
    const fixture = TestBed.createComponent(WidgetContainerComponent);

    fixture.componentInstance.ngOnInit();
    const icon = fixture.componentInstance.getWidgetIcon(0);
    await expect(icon).toEqual(firstWidgetItem.getIcon());
  });

  it('creates widgets for the layout', async () => {
    const fixture = TestBed.createComponent(WidgetContainerComponent);

    fixture.componentInstance.ngOnInit();
    fixture.componentInstance.resetLayout();
    const { factories } = fixture.componentInstance;
    await expect(factories.length).toBe(2);
    await expect(factories[0]).toBe(FirstWidget);
    await expect(factories[1]).toBe(SecondWidget);
    await expect(fixture.componentInstance.gridlayout).toBe('"a0 a1"');
  });
});
