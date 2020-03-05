import { OverlayContainer } from '@angular/cdk/overlay';
import { async, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import {
  MatCardModule,
  MatDialog,
  MatDividerModule,
  MatIconModule,
  MatMenuModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatToolbarModule,
} from '@angular/material';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IrcService } from 'src/app/services/irc/irc.service';
import { WidgetItem } from 'src/app/services/widget/widget-item';
import { WidgetService } from 'src/app/services/widget/widget.service';
import { TestUtils } from 'src/test/test-utils';
import { ConfigManager } from '../../services/data/config-manager';
import { UserService } from '../../services/user/user.service';
import { ErrorDialog } from '../error-dialog/error-dialog';
import { WidgetContainerComponent } from '../widget-container/widget-container.component';
import { WidgetFactoryComponent } from '../widget-factory/widget-factory.component';
import { GameComponent } from './game.component';
import { Config } from 'src/app/services/data/config-data';
import { UserData } from 'src/app/services/user/user.data';

export class ClassList {
  items = new Array<string>();

  add(value: string): void {
    this.items.push(value);
  }

  remove(value: string): void {
    const index = this.items.indexOf(value);
    if (index >= 0) {
      this.items.splice(index);
    }
  }
}

const ircServiceSpy = TestUtils.spyOnClass(IrcService);
const configManagerSpy = TestUtils.spyOnClass(ConfigManager);
const userServiceSpy = TestUtils.spyOnClass(UserService);
userServiceSpy.getUserInfo.and.returnValue({
  login: 'userService',
} as UserData);
const widgetServiceSpy = TestUtils.spyOnClass(WidgetService);
const overlayContainerSpy = jasmine.createSpyObj('OverlayContainer', [
  'getContainerElement',
]);
overlayContainerSpy.getContainerElement.and.returnValue({
  classList: new ClassList(),
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
        FormsModule,
      ],
      declarations: [
        GameComponent,
        WidgetContainerComponent,
        WidgetFactoryComponent,
      ],
      providers: [
        { provide: IrcService, useValue: ircServiceSpy },
        { provide: ConfigManager, useValue: configManagerSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: WidgetService, useValue: widgetServiceSpy },
        { provide: OverlayContainer, useValue: overlayContainerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
    configManagerSpy.getConfig.and.returnValue({
      authentication: {
        user: 'configManager',
        token: 'token',
        state: null,
        scope: null,
      },
      settings: {
        useDarkTheme: true,
        toolbarIcons: true,
        toolbarNames: true,
      },
      layout: [],
    } as Partial<Config>);
  }));

  it('should redirect if not authenticated', async () => {
    const fixture = TestBed.createComponent(GameComponent);
    const tokenlessSpy = TestUtils.spyOnClass(ConfigManager);
    tokenlessSpy.getConfig.and.returnValue({
      authentication: {
        user: 'testuser',
        token: null,
      },
    } as Partial<Config>);

    fixture.componentInstance.configManager = tokenlessSpy;
    await fixture.componentInstance.ngOnInit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should redirect if token cannot be validated', async () => {
    const fixture = TestBed.createComponent(GameComponent);
    const invalidTokenSpy = TestUtils.spyOnClass(UserService) as jasmine.SpyObj<
      UserService
    >;
    invalidTokenSpy.getUserInfo.and.returnValue(
      new Promise(resolve => {
        resolve({
          client_id: '',
          login: '',
          user_id: '',
          scopes: [],
        } as UserData);
      })
    );
    const auth = fixture.componentInstance.configManager.getConfig();

    fixture.componentInstance.userService = invalidTokenSpy;
    await fixture.componentInstance.ngOnInit();
    expect(auth.authentication.token).toBeNull();
    expect(configManagerSpy.save).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should connect to IRC', async () => {
    const fixture = TestBed.createComponent(GameComponent);

    await fixture.componentInstance.ngOnInit();
    const user = fixture.componentInstance.config.authentication.user;
    const target = (await userServiceSpy.getUserInfo(null)).login;
    expect(user).toBe(target);
    expect(configManagerSpy.save).toHaveBeenCalled();
    expect(ircServiceSpy.registerForError).toHaveBeenCalled();
    expect(ircServiceSpy.connect).toHaveBeenCalled();
  });

  it('should add the dark theme', () => {
    const fixture = TestBed.createComponent(GameComponent);

    fixture.componentInstance.updateOverlayTheme();
    expect(overlayContainerSpy.getContainerElement().classList.items).toContain(
      'dark-theme'
    );
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
    expect(configManagerSpy.save).toHaveBeenCalled();
    expect(overlaySpy).toHaveBeenCalled();
  });

  it('should add a widget to the layout', () => {
    const fixture = TestBed.createComponent(GameComponent);
    const toAdd = new WidgetItem(null, 'toAdd');

    fixture.componentInstance.toggleWidget(toAdd);
    expect(fixture.componentInstance.config.layout).toContain(toAdd.name!);
    expect(configManagerSpy.save).toHaveBeenCalled();
  });

  it('should remove a widget to the layout', () => {
    const fixture = TestBed.createComponent(GameComponent);
    const toRemove = new WidgetItem(null, 'toRemove');

    fixture.componentInstance.config.layout.push(toRemove.name!);
    fixture.componentInstance.toggleWidget(toRemove);
    expect(fixture.componentInstance.config.layout).not.toContain(
      toRemove.name!
    );
    expect(configManagerSpy.save).toHaveBeenCalled();
  });
});
