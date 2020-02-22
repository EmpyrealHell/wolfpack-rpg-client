import { TestBed, async } from '@angular/core/testing';
import { WidgetFactoryComponent } from './widget-factory.component';
import { Directive, ComponentFactory, ViewContainerRef } from '@angular/core';
import { WidgetContainerDirective } from 'src/app/directives/widget-container.directive';
import { WidgetComponent } from './widget.component';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { IrcService } from 'src/app/services/irc/irc.service';

const spyContainer = jasmine.createSpyObj('viewContainerRef', ['clear', 'createComponent']);
spyContainer.createComponent.and.returnValue({
  instance: {
    configManager: undefined,
    ircService: undefined,
    name: undefined,
    onActivate: () => { }
  } as WidgetComponent
});

@Directive({
  selector: '[appWidgetContainer]',
  providers: [
    {
      provide: WidgetContainerDirective,
      useClass: WidgetContainerStubDirective
    }
  ],
})
export class WidgetContainerStubDirective {
  public viewContainerRef: ViewContainerRef;
  constructor() {
    this.viewContainerRef = spyContainer;
  }
}

describe('WidgetContainerComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        WidgetFactoryComponent,
        WidgetContainerStubDirective
      ]
    }).compileComponents();
  }));

  it('should create a widget instance', () => {
    const fixture = TestBed.createComponent(WidgetFactoryComponent);
    const component = fixture.componentInstance;
    component.factory = {} as ComponentFactory<WidgetComponent>;
    component.configManager = {} as ConfigManager;
    component.ircService = {} as IrcService;
    component.name = 'componentName';
    const internalComponent = spyContainer.createComponent(null).instance;
    const internalSpy = spyOn(internalComponent, 'onActivate');

    component.ngOnInit();
    expect(spyContainer.clear).toHaveBeenCalled();
    expect(spyContainer.createComponent).toHaveBeenCalledWith(component.factory);
    expect(internalComponent.configManager).toBe(component.configManager);
    expect(internalComponent.ircService).toBe(component.ircService);
    expect(internalComponent.name).toBe(component.name);
    expect(internalSpy).toHaveBeenCalled();
  });
});
