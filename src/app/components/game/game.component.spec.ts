import { OverlayContainer } from '@angular/cdk/overlay';
import { async, TestBed } from '@angular/core/testing';
import {
  MatDialog, MatSidenavModule, MatDividerModule, MatMenuModule, MatIconModule,
  MatSlideToggleModule, MatToolbarModule, MatCardModule
} from '@angular/material';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IrcService } from 'src/app/services/irc/irc.service';
import { WidgetItem } from 'src/app/services/widget/widget-item';
import { WidgetService } from 'src/app/services/widget/widget.service';
import { ConfigManager } from '../../services/data/config-manager';
import { UserService } from '../../services/user/user.service';
import { ErrorDialog } from '../error-dialog/error-dialog';
import { GameComponent } from './game.component';
import { WidgetContainerComponent } from '../widget-container/widget-container.component';
import { FormsModule } from '@angular/forms';
import { WidgetFactoryComponent } from '../widget-factory/widget-factory.component';

export class ClassList {
  public items = new Array<string>();

  public add(value: string): void {
    this.items.push(value);
  }

  public remove(value: string): void {
    const index = this.items.indexOf(value);
    if (index >= 0) {
      this.items.splice(index);
    }
  }
}

const ircServiceSpy = jasmine.createSpyObj('IrcService', ['RegisterForError', 'Connect']);
const configManagerSpy = jasmine.createSpyObj('ConfigManager', ['Save', 'GetConfig']);
configManagerSpy.GetConfig.and.returnValue({
  Authentication: {
    User: 'configManager',
    Token: 'token'
  },
  Settings: {
    UseDarkTheme: true
  },
  Layout: []
});
const userServiceSpy = jasmine.createSpyObj('UserService', ['GetUserInfo']);
userServiceSpy.GetUserInfo.and.returnValue({
  login: 'userService'
});
const widgetServiceSpy = jasmine.createSpyObj('WidgetService', ['GetWidgets']);
const overlayContainerSpy = jasmine.createSpyObj('OverlayContainer', ['getContainerElement']);
overlayContainerSpy.getContainerElement.and.returnValue({
  classList: new ClassList()
});
const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

describe('GameComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatSidenavModule,
        MatDividerModule,
        MatMenuModule,
        MatIconModule,
        MatSlideToggleModule,
        MatToolbarModule,
        MatCardModule,
        FormsModule
      ],
      declarations: [
        GameComponent,
        WidgetContainerComponent,
        WidgetFactoryComponent
      ],
      providers: [
        { provide: IrcService, useValue: ircServiceSpy },
        { provide: ConfigManager, useValue: configManagerSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: WidgetService, useValue: widgetServiceSpy },
        { provide: OverlayContainer, useValue: overlayContainerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy },
      ]
    }).compileComponents();
  }));

  it('should redirect if not authenticated', async () => {
    const fixture = TestBed.createComponent(GameComponent);
    const tokenlessSpy = jasmine.createSpyObj('ConfigManager', ['GetConfig']);
    tokenlessSpy.GetConfig.and.returnValue({
      Authentication: {
        User: 'testuser',
        Token: undefined
      }
    });

    fixture.componentInstance.configManager = tokenlessSpy;
    await fixture.componentInstance.ngOnInit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should redirect if token cannot be validated', async () => {
    const fixture = TestBed.createComponent(GameComponent);
    const invalidTokenSpy = jasmine.createSpyObj('UserService', ['GetUserInfo']);
    invalidTokenSpy.GetUserInfo.and.returnValue({
      login: undefined
    });
    const auth = fixture.componentInstance.configManager.GetConfig();

    fixture.componentInstance.userService = invalidTokenSpy;
    await fixture.componentInstance.ngOnInit();
    expect(auth.Authentication.Token).toBeUndefined();
    expect(configManagerSpy.Save).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should connect to IRC', async () => {
    const fixture = TestBed.createComponent(GameComponent);

    await fixture.componentInstance.ngOnInit();
    const user = fixture.componentInstance.configManager.GetConfig().Authentication.User;
    const target = (await fixture.componentInstance.userService.GetUserInfo(null)).login;
    expect(user).toBe(target);
    expect(configManagerSpy.Save).toHaveBeenCalled();
    expect(ircServiceSpy.RegisterForError).toHaveBeenCalled();
    expect(ircServiceSpy.Connect).toHaveBeenCalled();
  });

  it('should add the dark theme', () => {
    const fixture = TestBed.createComponent(GameComponent);

    fixture.componentInstance.updateOverlayTheme();
    expect(overlayContainerSpy.getContainerElement().classList.items).toContain('dark-theme');
  });

  it('should present a modal on IRC error', () => {
    const fixture = TestBed.createComponent(GameComponent);
    const errorMessage = `modal test message ${Date.now()}`;

    fixture.componentInstance.onError(errorMessage);
    expect(dialogSpy.open).toHaveBeenCalled();
    const args = dialogSpy.open.calls.mostRecent().args;
    expect(args[0]).toBe(ErrorDialog);
    expect(args[1].data.message).toContain(errorMessage);
  });

  it('should save settings and update the interface', () => {
    const fixture = TestBed.createComponent(GameComponent);
    const overlaySpy = spyOn(fixture.componentInstance, 'updateOverlayTheme');

    fixture.componentInstance.updateSettings();
    expect(configManagerSpy.Save).toHaveBeenCalled();
    expect(overlaySpy).toHaveBeenCalled();
  });

  it('should add a widget to the layout', () => {
    const fixture = TestBed.createComponent(GameComponent);
    const toAdd = new WidgetItem(null, 'toAdd');

    fixture.componentInstance.toggleWidget(toAdd);
    expect(fixture.componentInstance.config.Layout).toContain(toAdd.name);
    expect(configManagerSpy.Save).toHaveBeenCalled();
  });

  it('should remove a widget to the layout', () => {
    const fixture = TestBed.createComponent(GameComponent);
    const toRemove = new WidgetItem(null, 'toRemove');

    fixture.componentInstance.config.Layout.push(toRemove.name);
    fixture.componentInstance.toggleWidget(toRemove);
    expect(fixture.componentInstance.config.Layout).not.toContain(toRemove.name);
    expect(configManagerSpy.Save).toHaveBeenCalled();
  });
});
