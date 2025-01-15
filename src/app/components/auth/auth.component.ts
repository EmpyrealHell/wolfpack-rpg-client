import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { AuthData } from 'src/app/services/user/auth.data';
import { environment } from 'src/environments/environment';
import { ConfigAuthentication } from '../../services/data/config-data';
import { ConfigManager } from '../../services/data/config-manager';
import { UserService } from '../../services/user/user.service';
import { Utils } from '../../util/utils';
import * as authConfig from './auth.component.json';

/**
 * Component that handles loading the app and making sure the user is
 * authenticated with a valid token. This allows subsequent components to
 * assume valid authentication.
 */
@Component({
  selector: 'app-auth',
  template: 'Authenticating...',
  standalone: false,
})
export class AuthComponent implements OnInit {
  route: ActivatedRouteSnapshot;
  retryCount = 3;

  /**
   * Parses the auth response from twitch. This handles the app loading after
   * the user has provided authentication through Twitch's OAuth API and been
   * redirected back to the app.
   * @param auth Auth data that should be loaded from local storage.
   * @param configManager Used to update local data if authentication fails.
   * @param fragmentString Url fragment string containing twitch responses.
   * @param userService Service to validate token if one is received.
   * @param router Router to redirect app once authentication is validated.
   */
  async ParseAuthResponse(
    auth: ConfigAuthentication,
    configManager: ConfigManager,
    // tslint:disable-next-line:align
    fragmentString: string,
    userService: UserService,
    router: Router
  ): Promise<void> {
    if (auth.state) {
      const fragmentMap = Utils.createMap('&', '=', fragmentString);
      const state = fragmentMap.get('state');
      const token = fragmentMap.get('access_token');
      if (state === auth.state && token) {
        auth.token = token;
        if (state !== auth.state) {
          console.log(
            `State didn't match. Expected ${auth.state}, received ${state}, reauthenticating.`
          );
        }
        if (!token) {
          console.log('Token was empty, reauthenticating.');
        }
        await this.ValidateToken(auth, configManager, userService, router);
      } else {
        alert(
          'An error occurred in the authentication process, resetting authentication.\n' +
            'If you see this message more than once it may indicate an error between you and twitch.'
        );
        auth.state = null;
        this.AuthenticateWithTwitch(auth, configManager);
      }
    } else {
      console.log('State was empty, reauthenticating.');
      this.AuthenticateWithTwitch(auth, configManager);
    }
  }

  /**
   * Validates an OAuth token with Twitch and reroutes the app to the main
   * interface if everything checks out.
   * @param auth Auth data that should be loaded from local storage.
   * @param configManager Used to update local data if authentication fails.
   * @param userService Service to validate token if one is received.
   * @param router Router to redirect app once authentication is validated.
   */
  async ValidateToken(
    auth: ConfigAuthentication,
    configManager: ConfigManager,
    // tslint:disable-next-line:align
    userService: UserService,
    router: Router
  ): Promise<void> {
    let data: AuthData | null = null;
    try {
      if (auth.token) {
        data = await userService.getUserAuth(auth.token);
      }
    } catch (error) {
      console.log('Encountered an error getting token validation data');
      console.log(error);
    }

    if (data && data.login && data.login.length > 0) {
      if (
        (auth.user && data.login !== auth.user) ||
        (auth.scope && !Utils.hasAll(data.scopes, auth.scope.split(' ')))
      ) {
        auth.scope = null;
        auth.state = null;
        this.AuthenticateWithTwitch(auth, configManager);
      } else {
        auth.user = data.login;
        auth.scope = Utils.stringJoin(' ', data.scopes);
        auth.authCount = 0;
        configManager.save();
        userService.updateCache(data);
        void router.navigate(['/play']);
      }
    } else {
      this.AuthenticateWithTwitch(auth, configManager);
    }
  }

  /**
   * Redirects the user to the Twitch authentication page with instructions to
   * be sent back to the app upon completion.
   * @param auth Auth data that should be loaded from local storage.
   * @param configManager Used to update local data if authentication fails.
   */
  AuthenticateWithTwitch(
    auth: ConfigAuthentication,
    configManager: ConfigManager
  ): void {
    if (auth.authCount === null) {
      auth.authCount = 0;
    } else {
      auth.authCount++;
    }
    const forceVerify = auth.state === null;
    auth.state = Utils.generateState(16);
    auth.token = null;
    configManager.save();

    const url =
      `${authConfig.url}?client_id=${authConfig.clientId}` +
      `&redirect_uri=${environment.redirectUri}&state=${auth.state}` +
      (forceVerify ? '&force_verify=true' : '') +
      `&response_type=token&scope=${authConfig.scope}`;
    this.Redirect(url);
  }

  /**
   * Redirects the browser to a url, which can be outside of teh angular zone.
   * @param url The url to send to the browser.
   */
  Redirect(url: string): void {
    window.location.href = url;
  }

  constructor(
    public configManager: ConfigManager,
    public userService: UserService,
    // tslint:disable-next-line:align
    private router: Router,
    route: ActivatedRoute
  ) {
    this.route = route.snapshot;
  }

  /**
   * Handles authentication and OAuth token verification before routing the
   * user to the main interface.
   */
  async ngOnInit(): Promise<void> {
    this.configManager.load();
    const config = this.configManager.getConfig();
    if (
      config.authentication.authCount !== null &&
      config.authentication.authCount > this.retryCount
    ) {
      config.authentication = new ConfigAuthentication();
      this.configManager.save();
    }
    if (this.route.fragment && this.route.fragment.length > 0) {
      await this.ParseAuthResponse(
        config.authentication,
        this.configManager,
        this.route.fragment,
        this.userService,
        this.router
      );
    } else if (config.authentication.token) {
      await this.ValidateToken(
        config.authentication,
        this.configManager,
        this.userService,
        this.router
      );
    } else {
      this.AuthenticateWithTwitch(config.authentication, this.configManager);
    }
  }
}
