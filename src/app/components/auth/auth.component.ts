import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ConfigAuthentication } from '../../services/data/config-data';
import { ConfigManager } from '../../services/data/config-manager';
import { UserData } from '../../services/user/user.data';
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
  template: 'Authenticating...'
})
export class AuthComponent implements OnInit {
  private route: ActivatedRouteSnapshot;

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
  public async ParseAuthResponse(auth: ConfigAuthentication, configManager: ConfigManager,
    // tslint:disable-next-line:align
    fragmentString: string, userService: UserService, router: Router): Promise<void> {
    console.log('Parsing auth response');
    if (auth.State) {
      const fragmentMap = Utils.CreateMap('&', '=', fragmentString);
      const state = fragmentMap.get('state');
      const token = fragmentMap.get('access_token');
      if (state === auth.State && token) {
        console.log('Token acquired!');
        auth.Token = token;
        await this.ValidateToken(auth, configManager, userService, router);
      } else {
        console.log('An error occurred in the authentication process, resetting authentication.\n' +
          'If you see this message more than once it may indicate an error between you and twitch.');
        auth.State = undefined;
        this.AuthenticateWithTwitch(auth, configManager);
      }
    } else {
      console.log('No auth state found');
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
  public async ValidateToken(auth: ConfigAuthentication, configManager: ConfigManager,
    // tslint:disable-next-line:align
    userService: UserService, router: Router): Promise<void> {
    console.log('Validating token');
    let data: UserData;
    try {
      data = await userService.GetUserInfo(auth.Token);
    } catch (error) {
      console.log('Encountered an error getting token validation data');
      console.log(error);
    }

    if (data && data.login && data.login.length > 0) {
      if ((auth.User && data.login !== auth.User) ||
        (auth.Scope && !Utils.HasAll(data.scopes, auth.Scope.split(' ')))) {
        console.log('User or scope do not match saved data, resetting');
        auth.Scope = undefined;
        auth.State = undefined;
        this.AuthenticateWithTwitch(auth, configManager);
      } else {
        console.log('Success!');
        auth.User = data.login;
        auth.Scope = Utils.StringJoin(' ', data.scopes);
        configManager.Save();
        userService.UpdateCache(data);
        router.navigate(['/play']);
      }
    } else {
      console.log('Unable to retrieve token validation data');
      this.AuthenticateWithTwitch(auth, configManager);
    }
  }

  /**
   * Redirects the user to the Twitch authentication page with instructions to
   * be sent back to the app upon completion.
   * @param auth Auth data that should be loaded from local storage.
   * @param configManager Used to update local data if authentication fails.
   */
  public AuthenticateWithTwitch(auth: ConfigAuthentication, configManager: ConfigManager): void {
    console.log('Heading to twitch to get a token');
    const forceVerify = (auth.State === undefined);
    auth.State = Utils.GenerateState(16);
    auth.Token = undefined;
    configManager.Save();

    window.location.href = `${authConfig.url}?client_id=${authConfig.clientId}` +
      `&redirect_uri=${environment.redirectUri}&state=${auth.State}` +
      (forceVerify ? '&force_verify=true' : '') +
      `&response_type=token&scope=${authConfig.scope}`;
  }

  constructor(public configManager: ConfigManager, public userService: UserService,
    // tslint:disable-next-line:align
    private router: Router, route: ActivatedRoute) {
    this.route = route.snapshot;
  }

  /**
   * Handles authentication and OAuth token verification before routing the
   * user to the main interface.
   */
  public async ngOnInit(): Promise<void> {
    console.log('Init!');
    this.configManager.Load();
    const config = this.configManager.GetConfig();
    console.log(config);
    if (this.route.fragment && this.route.fragment.length > 0) {
      await this.ParseAuthResponse(config.Authentication, this.configManager,
        this.route.fragment, this.userService, this.router);
    } else if (config.Authentication.Token) {
      await this.ValidateToken(config.Authentication, this.configManager,
        this.userService, this.router);
    } else {
      this.AuthenticateWithTwitch(config.Authentication, this.configManager);
    }
  }
}
