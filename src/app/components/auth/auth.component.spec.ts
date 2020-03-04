import { async, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TestUtils } from 'src/test/test-utils';
import { Config, ConfigAuthentication } from '../../services/data/config-data';
import { ConfigManager } from '../../services/data/config-manager';
import { UserData } from '../../services/user/user.data';
import { UserService } from '../../services/user/user.service';
import { AuthComponent } from './auth.component';

const username = 'testuser';
const scopes = 'chat:read';

const configManagerSpy = TestUtils.spyOnClass(ConfigManager);
const userServiceSpy = TestUtils.spyOnClass(UserService) as jasmine.SpyObj<UserService>;
const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
const activatedRouteSpy = {
  snapshot: {
    fragment: 'state=test&access_token=token'
  }
} as ActivatedRoute;

describe('AuthComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AuthComponent
      ],
      providers: [
        { provide: ConfigManager, useValue: configManagerSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();
    configManagerSpy.GetConfig.and.returnValue({
      Authentication: {
        Token: 'token'
      }
    });
    userServiceSpy.getUserInfo.and.returnValue(new Promise<UserData>(resolve => {
      resolve({
        client_id: '',
        login: username,
        user_id: '',
        scopes: [scopes]
      });
    }));
  }));

  it('should validate saved tokens', async () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const configAuth = new ConfigAuthentication();
    configAuth.token = 'token';

    await fixture.componentInstance.ValidateToken(configAuth, configManagerSpy, userServiceSpy, routerSpy);
    expect(userServiceSpy.getUserInfo).toHaveBeenCalled();
    expect(configAuth.user).toBe(username);
    expect(configAuth.scope).toBe(scopes);
    expect(configManagerSpy.Save).toHaveBeenCalled();
    expect(userServiceSpy.updateCache).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/play']);
  });

  it('should clear authentication if username changes', async () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const configAuth = new ConfigAuthentication();
    const authSpy = spyOn(fixture.componentInstance, 'AuthenticateWithTwitch');
    configAuth.user = `Not${username}`;
    configAuth.token = 'token';

    await fixture.componentInstance.ValidateToken(configAuth, configManagerSpy, userServiceSpy, routerSpy);
    expect(userServiceSpy.getUserInfo).toHaveBeenCalled();
    expect(configAuth.scope).toBe(null);
    expect(authSpy).toHaveBeenCalledWith(configAuth, configManagerSpy);
  });

  it('should clear authentication if scopes change', async () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const configAuth = new ConfigAuthentication();
    const authSpy = spyOn(fixture.componentInstance, 'AuthenticateWithTwitch');
    configAuth.scope = `${scopes} test:execute`;
    configAuth.token = 'token';

    await fixture.componentInstance.ValidateToken(configAuth, configManagerSpy, userServiceSpy, routerSpy);
    expect(userServiceSpy.getUserInfo).toHaveBeenCalled();
    expect(configAuth.user).toBeFalsy();
    expect(configAuth.scope).toBeFalsy();
    expect(authSpy).toHaveBeenCalledWith(configAuth, configManagerSpy);
  });

  it('should call twitch oauth', async () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const configAuth = new ConfigAuthentication();
    configAuth.state = '';
    const redirectSpy = spyOn(fixture.componentInstance, 'Redirect');

    await fixture.componentInstance.AuthenticateWithTwitch(configAuth, configManagerSpy);
    expect(configManagerSpy.Save).toHaveBeenCalled();
    expect(redirectSpy).toHaveBeenCalled();
    const redirectUrl = redirectSpy.calls.mostRecent().args[0];
    expect(redirectUrl).toContain('client_id');
    expect(redirectUrl).toContain('redirect_uri');
    expect(redirectUrl).toContain('state');
    expect(redirectUrl).not.toContain('force_verify=true');
    expect(redirectUrl).toContain('response_type=token');
    expect(redirectUrl).toContain('scope');
  });

  it('should call twitch oauth and force verification', async () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const configAuth = new ConfigAuthentication();
    const redirectSpy = spyOn(fixture.componentInstance, 'Redirect');

    await fixture.componentInstance.AuthenticateWithTwitch(configAuth, configManagerSpy);
    expect(configManagerSpy.Save).toHaveBeenCalled();
    expect(redirectSpy).toHaveBeenCalled();
    const redirectUrl = redirectSpy.calls.mostRecent().args[0];
    expect(redirectUrl).toContain('force_verify=true');
  });

  it('should parse the twitch response on load', async () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const parseSpy = spyOn(fixture.componentInstance, 'ParseAuthResponse');

    await fixture.componentInstance.ngOnInit();
    expect(configManagerSpy.Load).toHaveBeenCalled();
    expect(configManagerSpy.GetConfig).toHaveBeenCalled();
    expect(parseSpy).toHaveBeenCalled();
  });

  it('should validate an existing token on load', async () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const validateSpy = spyOn(fixture.componentInstance, 'ValidateToken');
    fixture.componentInstance.route = new ActivatedRouteSnapshot();
    fixture.componentInstance.route.fragment = '';

    await fixture.componentInstance.ngOnInit();
    expect(configManagerSpy.Load).toHaveBeenCalled();
    expect(configManagerSpy.GetConfig).toHaveBeenCalled();
    expect(validateSpy).toHaveBeenCalled();
  });

  it('should begin authentication on load', async () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const authSpy = spyOn(fixture.componentInstance, 'AuthenticateWithTwitch');
    fixture.componentInstance.route = new ActivatedRouteSnapshot();
    fixture.componentInstance.route.fragment = '';
    const tokenProvider = TestUtils.spyOnClass(ConfigManager);
    tokenProvider.GetConfig.and.returnValue(new Config());
    fixture.componentInstance.configManager = tokenProvider;

    await fixture.componentInstance.ngOnInit();
    expect(tokenProvider.Load).toHaveBeenCalled();
    expect(tokenProvider.GetConfig).toHaveBeenCalled();
    expect(authSpy).toHaveBeenCalled();
  });
});
