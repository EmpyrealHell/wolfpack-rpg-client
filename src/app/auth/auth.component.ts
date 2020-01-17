import { Router, ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';
import { OnInit, Component } from '@angular/core';
import { AuthService } from './auth.service';

@Component({
    selector: 'app-auth',
    template: '',
})
export class AuthComponent implements OnInit {
    private route: ActivatedRouteSnapshot;
    constructor(private authService: AuthService, private router: Router, route: ActivatedRoute) {
        this.route = route.snapshot;
    }

    public ngOnInit() {
        const tokenData = this.authService.GetAuthData();
        this.authService.LoadState();
        if (tokenData.State) {
            const fragments = this.route.fragment.split('&');
            const fragmentMap = new Map<string, string>();
            for (const fragment of fragments) {
                const [key, value] = fragment.split('=');
                fragmentMap.set(key, value);
            }
            if (fragmentMap.get('state') === tokenData.State) {
                tokenData.Token = fragmentMap.get('access_token');
                this.router.navigate(['/play']);
            } else {
                // tslint:disable-next-line: max-line-length
                window.alert('CSRF attack detected, resetting authentication. If you see this message more than once it may indicate an error between you and twitch.');
                tokenData.State = undefined;
                this.authService.SaveState();
                this.router.navigate(['/']);
            }
        } else {
            this.router.navigate(['/']);
        }
    }
}
