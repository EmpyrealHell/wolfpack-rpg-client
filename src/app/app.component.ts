import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';

import { ConfigManager } from './data/config-manager';
import { ConfigAuthentication } from './data/config-data';
import { UserService } from './user/user.service';
import { UserData } from './user/user.data';
import { Utils } from './util/utils';

/**
 * Component that handles loading the app and making sure the user is
 * authenticated with a valid token. This allows subsequent components to
 * assume valid authentication.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor() { }
}
