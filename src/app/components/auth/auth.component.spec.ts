import { async, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Config, ConfigAuthentication } from '../../services/data/config-data';
import { ConfigManager } from '../../services/data/config-manager';
import { UserService } from '../../services/user/user.service';
import { AuthComponent } from './auth.component';

const username = 'testuser';
const scopes = 'chat:read';

const configManagerSpy = jasmine.createSpyObj('ConfigManager', ['Save', 'Load', 'GetConfig']);
configManagerSpy.GetConfig.and.returnValue({
  Authentication: {
    Token: undefined
  }
});
const userServiceSpy = jasmine.createSpyObj('UserService', ['GetUserInfo', 'UpdateCache']);
userServiceSpy.GetUserInfo.and.returnValue({
  login: username,
  scopes: [scopes]
});
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
  }));

  it('should validate saved tokens', async () => {
    const fixture = TestBed.createComponent(AuthComponent);

    const configAuth = new ConfigAuthentication();
    await fixture.componentInstance.ValidateToken(configAuth, configManagerSpy, userServiceSpy, routerSpy);
    expect(userServiceSpy.GetUserInfo).toHaveBeenCalled();
    expect(configAuth.User).toBe(username);
    expect(configAuth.Scope).toBe(scopes);
    expect(configManagerSpy.Save).toHaveBeenCalled();
    expect(userServiceSpy.UpdateCache).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/play']);
  });

  it('should clear authentication if username changes', async () => {
    const fixture = TestBed.createComponent(AuthComponent);

    const configAuth = new ConfigAuthentication();
    const authSpy = spyOn(fixture.componentInstance, 'AuthenticateWithTwitch');
    configAuth.User = `Not${username}`;
    await fixture.componentInstance.ValidateToken(configAuth, configManagerSpy, userServiceSpy, routerSpy);
    expect(userServiceSpy.GetUserInfo).toHaveBeenCalled();
    expect(configAuth.Scope).toBe(null);
    expect(authSpy).toHaveBeenCalledWith(configAuth, configManagerSpy);
  });

  it('should clear authentication if scopes change', async () => {
    const fixture = TestBed.createComponent(AuthComponent);

    const configAuth = new ConfigAuthentication();
    const authSpy = spyOn(fixture.componentInstance, 'AuthenticateWithTwitch');
    configAuth.Scope = `${scopes} test:execute`;
    await fixture.componentInstance.ValidateToken(configAuth, configManagerSpy, userServiceSpy, routerSpy);
    expect(userServiceSpy.GetUserInfo).toHaveBeenCalled();
    expect(configAuth.User).toBeFalsy();
    expect(configAuth.Scope).toBeFalsy();
    expect(authSpy).toHaveBeenCalledWith(configAuth, configManagerSpy);
  });

  it('should call twitch oauth', async () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const configAuth = new ConfigAuthentication();
    configAuth.State = '';
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
    const configValue = new Config();
    configValue.Authentication.Token = 'token';
    const tokenProvider = jasmine.createSpyObj<ConfigManager>('ConfigManager', ['Load', 'GetConfig']);
    tokenProvider.GetConfig.and.returnValue(configValue);
    fixture.componentInstance.configManager = tokenProvider;
    fixture.componentInstance.route = new ActivatedRouteSnapshot();
    fixture.componentInstance.route.fragment = '';

    await fixture.componentInstance.ngOnInit();
    expect(tokenProvider.Load).toHaveBeenCalled();
    expect(tokenProvider.GetConfig).toHaveBeenCalled();
    expect(validateSpy).toHaveBeenCalled();
  });

  it('should begin authentication on load', async () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const authSpy = spyOn(fixture.componentInstance, 'AuthenticateWithTwitch');
    fixture.componentInstance.route = new ActivatedRouteSnapshot();
    fixture.componentInstance.route.fragment = '';

    await fixture.componentInstance.ngOnInit();
    expect(configManagerSpy.Load).toHaveBeenCalled();
    expect(configManagerSpy.GetConfig).toHaveBeenCalled();
    expect(authSpy).toHaveBeenCalled();
  });
});
