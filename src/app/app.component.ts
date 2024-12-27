import { Component } from '@angular/core';

/**
 * Component that handles loading the app and making sure the user is
 * authenticated with a valid token. This allows subsequent components to
 * assume valid authentication.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
})
export class AppComponent {
  constructor() {}
}
