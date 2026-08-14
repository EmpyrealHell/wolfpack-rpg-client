import { TestBed, waitForAsync } from '@angular/core/testing';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TestUtils } from 'src/test/test-utils';
import { Config, ConfigAuthentication } from '../../services/data/config-data';
import { ConfigManager } from '../../services/data/config-manager';
import { AuthData } from '../../services/user/auth.data';
import { UserService } from '../../services/user/user.service';
import { AuthComponent } from './auth.component';

const username = 'testuser',
  scopes = 'chat:read',
  configManagerSpy = TestUtils.spyOnClass(ConfigManager),
  userServiceSpy = TestUtils.spyOnClass(
    UserService
  ) as jasmine.SpyObj<UserService>,
  routerSpy = jasmine.createSpyObj('Router', ['navigate']),
  activatedRouteSpy = {
    snapshot: {
      fragment: 'state=test&access_token=token',
    },
  } as ActivatedRoute;

describe('AuthComponent', () => {
  beforeEach(waitForAsync(async () => {
    await TestBed.configureTestingModule({
    imports: [RouterTestingModule, AuthComponent],
    providers: [
        { provide: ConfigManager, useValue: configManagerSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
    ],
}).compileComponents();
    configManagerSpy.getConfig.and.returnValue({
      authentication: {
        token: 'token',
      },
    } as Partial<Config>);
    userServiceSpy.getUserAuth.and.returnValue(
      new Promise<AuthData>(resolve => {
        resolve({
          client_id: '',
          login: username,
          user_id: '',
          scopes: [scopes],
        });
      })
    );
  }));

  it('should validate saved tokens', async () => {
    const fixture = TestBed.createComponent(AuthComponent),
      configAuth = new ConfigAuthentication();
    configAuth.token = 'token';

    await fixture.componentInstance.ValidateToken(
      configAuth,
      configManagerSpy,
      userServiceSpy,
      routerSpy
    );
    await expect(userServiceSpy.getUserAuth).toHaveBeenCalled();
    await expect(configAuth.user).toBe(username);
    await expect(configAuth.scope).toBe(scopes);
    await expect(configManagerSpy.save).toHaveBeenCalled();
    await expect(userServiceSpy.updateCache).toHaveBeenCalled();
    await expect(routerSpy.navigate).toHaveBeenCalledWith(['/play']);
  });

  it('should clear authentication if username changes', async () => {
    const fixture = TestBed.createComponent(AuthComponent),
      configAuth = new ConfigAuthentication(),
      authSpy = spyOn(fixture.componentInstance, 'AuthenticateWithTwitch');
    configAuth.user = `Not${username}`;
    configAuth.token = 'token';

    await fixture.componentInstance.ValidateToken(
      configAuth,
      configManagerSpy,
      userServiceSpy,
      routerSpy
    );
    await expect(userServiceSpy.getUserAuth).toHaveBeenCalled();
    await expect(configAuth.scope).toBe(null);
    await expect(authSpy).toHaveBeenCalledWith(configAuth, configManagerSpy);
  });

  it('should clear authentication if scopes change', async () => {
    const fixture = TestBed.createComponent(AuthComponent),
      configAuth = new ConfigAuthentication(),
      authSpy = spyOn(fixture.componentInstance, 'AuthenticateWithTwitch');
    configAuth.scope = `${scopes} test:execute`;
    configAuth.token = 'token';

    await fixture.componentInstance.ValidateToken(
      configAuth,
      configManagerSpy,
      userServiceSpy,
      routerSpy
    );
    await expect(userServiceSpy.getUserAuth).toHaveBeenCalled();
    await expect(configAuth.user).toBeFalsy();
    await expect(configAuth.scope).toBeFalsy();
    await expect(authSpy).toHaveBeenCalledWith(configAuth, configManagerSpy);
  });

  it('should call twitch oauth', async () => {
    const fixture = TestBed.createComponent(AuthComponent),
      configAuth = new ConfigAuthentication();
    configAuth.state = '';
    const redirectSpy = spyOn(fixture.componentInstance, 'Redirect');

    await fixture.componentInstance.AuthenticateWithTwitch(
      configAuth,
      configManagerSpy
    );
    await expect(configManagerSpy.save).toHaveBeenCalled();
    await expect(redirectSpy).toHaveBeenCalled();
    const redirectUrl = redirectSpy.calls.mostRecent().args[0];
    await expect(redirectUrl).toContain('client_id');
    await expect(redirectUrl).toContain('redirect_uri');
    await expect(redirectUrl).toContain('state');
    await expect(redirectUrl).not.toContain('force_verify=true');
    await expect(redirectUrl).toContain('response_type=token');
    await expect(redirectUrl).toContain('scope');
  });

  it('should call twitch oauth and force verification', async () => {
    const fixture = TestBed.createComponent(AuthComponent),
      configAuth = new ConfigAuthentication(),
      redirectSpy = spyOn(fixture.componentInstance, 'Redirect');

    await fixture.componentInstance.AuthenticateWithTwitch(
      configAuth,
      configManagerSpy
    );
    await expect(configManagerSpy.save).toHaveBeenCalled();
    await expect(redirectSpy).toHaveBeenCalled();
    const redirectUrl = redirectSpy.calls.mostRecent().args[0];
    await expect(redirectUrl).toContain('force_verify=true');
  });

  it('should parse the twitch response on load', async () => {
    const fixture = TestBed.createComponent(AuthComponent),
      parseSpy = spyOn(fixture.componentInstance, 'ParseAuthResponse');

    await fixture.componentInstance.ngOnInit();
    await expect(configManagerSpy.load).toHaveBeenCalled();
    await expect(configManagerSpy.getConfig).toHaveBeenCalled();
    await expect(parseSpy).toHaveBeenCalled();
  });

  it('should validate an existing token on load', async () => {
    const fixture = TestBed.createComponent(AuthComponent),
      validateSpy = spyOn(fixture.componentInstance, 'ValidateToken');
    fixture.componentInstance.route = new ActivatedRouteSnapshot();
    fixture.componentInstance.route.fragment = '';

    await fixture.componentInstance.ngOnInit();
    await expect(configManagerSpy.load).toHaveBeenCalled();
    await expect(configManagerSpy.getConfig).toHaveBeenCalled();
    await expect(validateSpy).toHaveBeenCalled();
  });

  it('should begin authentication on load', async () => {
    const fixture = TestBed.createComponent(AuthComponent),
      authSpy = spyOn(fixture.componentInstance, 'AuthenticateWithTwitch');
    fixture.componentInstance.route = new ActivatedRouteSnapshot();
    fixture.componentInstance.route.fragment = '';
    const tokenProvider = TestUtils.spyOnClass(ConfigManager);
    tokenProvider.getConfig.and.returnValue(new Config());
    fixture.componentInstance.configManager = tokenProvider;

    await fixture.componentInstance.ngOnInit();
    await expect(tokenProvider.load).toHaveBeenCalled();
    await expect(tokenProvider.getConfig).toHaveBeenCalled();
    await expect(authSpy).toHaveBeenCalled();
  });
});
