import { Directive, Type, ViewContainerRef } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { WidgetContainerDirective } from 'src/app/directives/widget-container.directive';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { WidgetFactoryComponent } from './widget-factory.component';
import { EventSubService } from 'src/app/services/eventsub/eventsub.service';
import { ConsoleWidgetComponent } from 'src/app/widgets/console/console.widget';

const spyContainer = jasmine.createSpyObj('viewContainerRef', [
  'clear',
  'createComponent',
]);
spyContainer.createComponent.and.returnValue({
  instance: new ConsoleWidgetComponent(),
});

@Directive({
  selector: '[appWidgetContainer]',
  providers: [
    {
      provide: WidgetContainerDirective,
      useClass: WidgetContainerStubDirective,
    },
  ],
})
export class WidgetContainerStubDirective {
  viewContainerRef: ViewContainerRef;
  constructor() {
    this.viewContainerRef = spyContainer;
  }
}

describe('WidgetContainerComponent', () => {
  beforeEach(waitForAsync(async () => {
    await TestBed.configureTestingModule({
      imports: [WidgetContainerStubDirective, ConsoleWidgetComponent],
      providers: [
        {
          provide: WidgetFactoryComponent,
        },
      ],
    }).compileComponents();
  }));

  it('should create a widget instance', async () => {
    const fixture = TestBed.inject(WidgetFactoryComponent),
      component = fixture;
    component.factory = {} as Type<ConsoleWidgetComponent>;
    component.configManager = {} as ConfigManager;
    component.eventSubService = {} as EventSubService;
    component.name = 'Console';
    component.container = new WidgetContainerStubDirective();
    const internalComponent = spyContainer.createComponent(
        component.factory
      ).instance,
      internalSpy = spyOn(internalComponent, 'onActivate');

    component.ngOnInit();
    await expect(spyContainer.clear).toHaveBeenCalled();
    await expect(spyContainer.createComponent).toHaveBeenCalledWith(
      component.factory
    );
    await expect(internalComponent.configManager).toBe(component.configManager);
    await expect(internalComponent.eventSubService).toBe(
      component.eventSubService
    );
    await expect(internalComponent.name).toBe(component.name);
    await expect(internalSpy).toHaveBeenCalled();
  });
});
