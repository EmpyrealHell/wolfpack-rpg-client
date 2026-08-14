import { ComponentFactory, Directive, ViewContainerRef } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { WidgetContainerDirective } from 'src/app/directives/widget-container.directive';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { WidgetFactoryComponent } from './widget-factory.component';
import { WidgetComponent } from './widget.component';
import { EventSubService } from 'src/app/services/eventsub/eventsub.service';

const spyContainer = jasmine.createSpyObj('viewContainerRef', [
  'clear',
  'createComponent',
]);
spyContainer.createComponent.and.returnValue({
  instance: {
    configManager: undefined,
    eventSubService: undefined,
    name: '',
    onActivate: () => {},
  } as WidgetComponent,
});

@Directive({
  selector: '[appWidgetContainer]',
  providers: [
    {
      provide: WidgetContainerDirective,
      useClass: WidgetContainerStubDirective,
    },
  ],
  standalone: false,
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
      declarations: [WidgetFactoryComponent, WidgetContainerStubDirective],
    }).compileComponents();
  }));

  it('should create a widget instance', async () => {
    const fixture = TestBed.createComponent(WidgetFactoryComponent),
      component = fixture.componentInstance;
    component.factory = {} as ComponentFactory<WidgetComponent>;
    component.configManager = {} as ConfigManager;
    component.eventSubService = {} as EventSubService;
    component.name = 'componentName';
    const internalComponent = spyContainer.createComponent(null).instance,
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
