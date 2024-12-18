import { waitForAsync, TestBed } from '@angular/core/testing';
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

const username = 'testuser';
const scopes = 'chat:read';

const configManagerSpy = TestUtils.spyOnClass(ConfigManager);
const userServiceSpy = TestUtils.spyOnClass(UserService) as jasmine.SpyObj<
  UserService
>;
const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
const activatedRouteSpy = {
  snapshot: {
    fragment: 'state=test&access_token=token',
  },
} as ActivatedRoute;

describe('AuthComponent', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule],
        declarations: [AuthComponent],
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
    })
  );

  it('should validate saved tokens', async () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const configAuth = new ConfigAuthentication();
    configAuth.token = 'token';

    await fixture.componentInstance.ValidateToken(
      configAuth,
      configManagerSpy,
      userServiceSpy,
      routerSpy
    );
    expect(userServiceSpy.getUserAuth).toHaveBeenCalled();
    expect(configAuth.user).toBe(username);
    expect(configAuth.scope).toBe(scopes);
    expect(configManagerSpy.save).toHaveBeenCalled();
    expect(userServiceSpy.updateCache).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/play']);
  });

  it('should clear authentication if username changes', async () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const configAuth = new ConfigAuthentication();
    const authSpy = spyOn(fixture.componentInstance, 'AuthenticateWithTwitch');
    configAuth.user = `Not${username}`;
    configAuth.token = 'token';

    await fixture.componentInstance.ValidateToken(
      configAuth,
      configManagerSpy,
      userServiceSpy,
      routerSpy
    );
    expect(userServiceSpy.getUserAuth).toHaveBeenCalled();
    expect(configAuth.scope).toBe(null);
    expect(authSpy).toHaveBeenCalledWith(configAuth, configManagerSpy);
  });

  it('should clear authentication if scopes change', async () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const configAuth = new ConfigAuthentication();
    const authSpy = spyOn(fixture.componentInstance, 'AuthenticateWithTwitch');
    configAuth.scope = `${scopes} test:execute`;
    configAuth.token = 'token';

    await fixture.componentInstance.ValidateToken(
      configAuth,
      configManagerSpy,
      userServiceSpy,
      routerSpy
    );
    expect(userServiceSpy.getUserAuth).toHaveBeenCalled();
    expect(configAuth.user).toBeFalsy();
    expect(configAuth.scope).toBeFalsy();
    expect(authSpy).toHaveBeenCalledWith(configAuth, configManagerSpy);
  });

  it('should call twitch oauth', async () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const configAuth = new ConfigAuthentication();
    configAuth.state = '';
    const redirectSpy = spyOn(fixture.componentInstance, 'Redirect');

    await fixture.componentInstance.AuthenticateWithTwitch(
      configAuth,
      configManagerSpy
    );
    expect(configManagerSpy.save).toHaveBeenCalled();
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

    await fixture.componentInstance.AuthenticateWithTwitch(
      configAuth,
      configManagerSpy
    );
    expect(configManagerSpy.save).toHaveBeenCalled();
    expect(redirectSpy).toHaveBeenCalled();
    const redirectUrl = redirectSpy.calls.mostRecent().args[0];
    expect(redirectUrl).toContain('force_verify=true');
  });

  it('should parse the twitch response on load', async () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const parseSpy = spyOn(fixture.componentInstance, 'ParseAuthResponse');

    await fixture.componentInstance.ngOnInit();
    expect(configManagerSpy.load).toHaveBeenCalled();
    expect(configManagerSpy.getConfig).toHaveBeenCalled();
    expect(parseSpy).toHaveBeenCalled();
  });

  it('should validate an existing token on load', async () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const validateSpy = spyOn(fixture.componentInstance, 'ValidateToken');
    fixture.componentInstance.route = new ActivatedRouteSnapshot();
    fixture.componentInstance.route.fragment = '';

    await fixture.componentInstance.ngOnInit();
    expect(configManagerSpy.load).toHaveBeenCalled();
    expect(configManagerSpy.getConfig).toHaveBeenCalled();
    expect(validateSpy).toHaveBeenCalled();
  });

  it('should begin authentication on load', async () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const authSpy = spyOn(fixture.componentInstance, 'AuthenticateWithTwitch');
    fixture.componentInstance.route = new ActivatedRouteSnapshot();
    fixture.componentInstance.route.fragment = '';
    const tokenProvider = TestUtils.spyOnClass(ConfigManager);
    tokenProvider.getConfig.and.returnValue(new Config());
    fixture.componentInstance.configManager = tokenProvider;

    await fixture.componentInstance.ngOnInit();
    expect(tokenProvider.load).toHaveBeenCalled();
    expect(tokenProvider.getConfig).toHaveBeenCalled();
    expect(authSpy).toHaveBeenCalled();
  });
});
