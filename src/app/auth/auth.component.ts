import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';

import { ConfigManager } from '../data/config-manager';
import { ConfigAuthentication } from '../data/config-data';
import { UserService } from '../user/user.service';
import { UserData } from '../user/user.data';
import { Utils } from '../util/utils';

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
    public static async ParseAuthResponse(auth: ConfigAuthentication, configManager: ConfigManager,
        // tslint:disable-next-line:align
        fragmentString: string, userService: UserService, router: Router): Promise<void> {
        if (auth.State) {
            const fragmentMap = Utils.CreateMap('&', '=', fragmentString);
            const state = fragmentMap.get('state');
            const token = fragmentMap.get('access_token');
            if (state === auth.State && token) {
                auth.Token = token;
                await AuthComponent.ValidateToken(auth, configManager, userService, router);
            } else {
                window.alert('An error occurred in the authentication process, resetting authentication.\n' +
                    'If you see this message more than once it may indicate an error between you and twitch.');
                auth.State = undefined;
                AuthComponent.AuthenticateWithTwitch(auth, configManager);
            }
        } else {
            AuthComponent.AuthenticateWithTwitch(auth, configManager);
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
    public static async ValidateToken(auth: ConfigAuthentication, configManager: ConfigManager,
        // tslint:disable-next-line:align
        userService: UserService, router: Router): Promise<void> {
        let data: UserData;
        try {
            data = await userService.GetUserInfo(auth.Token).toPromise();
        } catch { }

        if (data && data.login && data.login.length > 0) {
            if ((auth.User && data.login !== auth.User) ||
                (auth.Scope && !Utils.HasAll(data.scopes, auth.Scope.split(' ')))) {
                auth.Scope = undefined;
                this.AuthenticateWithTwitch(auth, configManager);
            } else {
                auth.User = data.login;
                auth.Scope = Utils.StringJoin(' ', data.scopes);
                configManager.Save();
                userService.UpdateCache(data);
                router.navigate(['/play']);
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
    public static AuthenticateWithTwitch(auth: ConfigAuthentication, configManager: ConfigManager) {
        const forceVerify = (auth.State === undefined);
        auth.State = Utils.GenerateState(16);
        auth.Token = undefined;
        configManager.Save();
        const url = 'https://id.twitch.tv/oauth2/authorize';

        const clientId = 'full2dvcfxpu2g8pgalowdipot41ft';
        const redirectUri = 'http://localhost:4200/auth';

        const params = `?client_id=${clientId}&redirect_uri=${redirectUri}` +
            `&state=${auth.State}` +
            (forceVerify ? '&force_verify=true' : '') +
            '&response_type=token&scope=chat:read whispers:read whispers:edit';
        window.location.href = url + params;
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
        this.configManager.Load();
        const config = this.configManager.GetConfig();
        if (this.route.fragment && this.route.fragment.length > 0) {
            await AuthComponent.ParseAuthResponse(config.Authentication, this.configManager,
                this.route.fragment, this.userService, this.router);
        } else if (config.Authentication.Token) {
            await AuthComponent.ValidateToken(config.Authentication, this.configManager,
                this.userService, this.router);
        } else {
            AuthComponent.AuthenticateWithTwitch(config.Authentication, this.configManager);
        }
    }
}
