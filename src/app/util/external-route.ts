import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { State } from './state';

@Injectable()
export class ExternalRoute implements CanActivate {
    private static urlKey = 'externalUrl';
    private static queryKey = 'queryParams';

    constructor(private authService: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let uri = route.data[ExternalRoute.urlKey];
        const queryParams = route.data[ExternalRoute.queryKey];

        const tokenData = this.authService.GetAuthData();
        this.authService.LoadState();
        if (!tokenData.State) {
            tokenData.State = State.Generate(16);
            this.authService.SaveState();
            queryParams.force_verify = true;
        }
        queryParams.state = tokenData.State;

        if (queryParams) {
            let queryString = '';
            for (const [key, value] of Object.entries(queryParams)) {
                queryString += `&${key}=${value}`;
            }
            if (queryString.length > 0) {
                uri += `?${queryString.substring(1)}`;
            }
        }
        window.location.href = uri;
        return false;
    }
}
