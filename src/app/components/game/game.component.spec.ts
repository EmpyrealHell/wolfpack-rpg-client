import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WidgetItem } from 'src/app/services/widget/widget-item';
import { TestUtils } from 'src/test/test-utils';
import { ConfigManager } from '../../services/data/config-manager';
import { UserService } from '../../services/user/user.service';
import { ErrorDialog } from '../error-dialog/error-dialog';
import { WidgetContainerComponent } from '../widget-container/widget-container.component';
import { WidgetFactoryComponent } from '../widget-factory/widget-factory.component';
import { GameComponent } from './game.component';
import { Config } from 'src/app/services/data/config-data';
import { AuthData } from 'src/app/services/user/auth.data';
import { AccessControlService } from 'src/app/services/access-control/access-control-service';
import { EventSubService, Message } from 'src/app/services/eventsub/eventsub.service';

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

const eventSubServiceSpy = TestUtils.spyOnClass(EventSubService);
const configManagerSpy = TestUtils.spyOnClass(ConfigManager);
const userServiceSpy = TestUtils.spyOnClass(UserService);
userServiceSpy.getUserAuth.and.returnValue({
  login: 'userService',
} as AuthData);
const accessControlServiceSpy = TestUtils.spyOnClass(AccessControlService);
const overlayContainerSpy = jasmine.createSpyObj('OverlayContainer', [
  'getContainerElement',
]);
overlayContainerSpy.getContainerElement.and.returnValue({
  classList: new ClassList(),
});
const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

describe('GameComponent', () => {
  beforeEach(async () => {
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
        { provide: EventSubService, useValue: eventSubServiceSpy },
        { provide: ConfigManager, useValue: configManagerSpy },
        { provide: UserService, useValue: userServiceSpy },
        {
          provide: AccessControlService,
          useValue: accessControlServiceSpy,
        },
        { provide: OverlayContainer, useValue: overlayContainerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
    waitForAsync(
      configManagerSpy.getConfig.and.returnValue({
        authentication: {
          user: 'configManager',
          token: 'token',
          state: null,
          scope: null,
          authCount: 0,
        },
        settings: {
          useDarkTheme: true,
          toolbarIcons: true,
          toolbarNames: true,
          playSounds: true,
          soundVolume: 0.5,
        },
        layout: [],
      } as Partial<Config>)
    );
  });

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
    invalidTokenSpy.getUserAuth.and.returnValue(
      new Promise(resolve => {
        resolve({
          client_id: '',
          login: '',
          user_id: '',
          scopes: [],
        } as AuthData);
      })
    );
    const auth = fixture.componentInstance.configManager.getConfig();

    fixture.componentInstance.userService = invalidTokenSpy;
    await fixture.componentInstance.ngOnInit();
    expect(auth.authentication.token).toBeNull();
    expect(configManagerSpy.save).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should connect to EventSub', async () => {
    const fixture = TestBed.createComponent(GameComponent);

    await fixture.componentInstance.ngOnInit();
    const user = fixture.componentInstance.config.authentication.user;
    const target = (await userServiceSpy.getUserAuth(null)).login;
    expect(user).toBe(target);
    expect(configManagerSpy.save).toHaveBeenCalled();
    expect(eventSubServiceSpy.registerForError).toHaveBeenCalled();
    expect(eventSubServiceSpy.connect).toHaveBeenCalled();
  });

  it('should add the dark theme', () => {
    const fixture = TestBed.createComponent(GameComponent);

    fixture.componentInstance.updateOverlayTheme();
    expect(overlayContainerSpy.getContainerElement().classList.items).toContain(
      'dark-theme'
    );
  });

  it('should present a modal on EventSub error', () => {
    const fixture = TestBed.createComponent(GameComponent);
    const errorMessage = `modal test message ${Date.now()}`;

    fixture.componentInstance.onError(new Message(errorMessage, false, true));
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
    const toAdd = new WidgetItem(null, 'toAdd', 'toAdd', 'to-add');

    fixture.componentInstance.toggleWidget(toAdd);
    expect(fixture.componentInstance.config.layout).toContain(toAdd.id);
    expect(configManagerSpy.save).toHaveBeenCalled();
  });

  it('should remove a widget to the layout', () => {
    const fixture = TestBed.createComponent(GameComponent);
    const toRemove = new WidgetItem(null, 'toRemove', 'toRemove', 'to-remove');

    fixture.componentInstance.config.layout.push(toRemove.id);
    fixture.componentInstance.toggleWidget(toRemove);
    expect(fixture.componentInstance.config.layout).not.toContain(toRemove.id);
    expect(configManagerSpy.save).toHaveBeenCalled();
  });
});
