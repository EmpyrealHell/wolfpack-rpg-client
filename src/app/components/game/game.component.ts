import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { WidgetItem } from 'src/app/services/widget/widget-item';
import { WidgetService } from 'src/app/services/widget/widget.service';
import { Config, ConfigAuthentication } from '../../services/data/config-data';
import { ConfigManager } from '../../services/data/config-manager';
import { IrcService } from '../../services/irc/irc.service';
import { UserService } from '../../services/user/user.service';
import { ErrorDialog } from '../error-dialog/error-dialog';
import * as PackageJson from '../../../../package.json';

/**
 * The main component holding the game UI.
 */
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
})
export class GameComponent implements OnInit {
  /**
   * Reference to the user config object.
   */
  config = new Config();
  /**
   * Username from the validated token.
   */
  username = '';
  /**
   * List of all widgets.
   */
  widgets: WidgetItem[] = [];
  /**
   * The current version of the app.
   */
  version = PackageJson.version

  constructor(
    public ircService: IrcService,
    public configManager: ConfigManager,
    public userService: UserService,
    public widgetService: WidgetService,
    public overlayContainer: OverlayContainer,
    public dialog: MatDialog,
    public router: Router,
  ) { }

  async ngOnInit(): Promise<void> {
    this.widgets = this.widgetService.getWidgets();
    const config = this.configManager.getConfig();
    this.updateOverlayTheme();

    const token = config.authentication.token;
    if (!token) {
      this.router.navigate(['/']);
    } else {
      const userData = await this.userService.getUserInfo(token);
      if (userData && userData.login) {
        config.authentication.user = userData.login;
        this.configManager.save();
        this.config = config;
        this.ircService.registerForError('game', (message) => { this.onError(message); }, true);
        this.ircService.connect();
      } else {
        config.authentication.token = null;
        this.configManager.save();
        this.router.navigate(['/']);
      }
    }
  }

  openIssuesPage(): void {
    window.open('https://github.com/EmpyrealHell/wolfpack-rpg-client/issues/new', '_blank');
  }

  /**
   * Updates the overlay container with the appropriate theme based on the
   * user's preferences.
   */
  updateOverlayTheme(): void {
    if (this.config.settings.useDarkTheme) {
      this.overlayContainer.getContainerElement().classList.add('dark-theme');
    } else {
      this.overlayContainer.getContainerElement().classList.remove('dark-theme');
    }
  }

  /**
   * Callback used for handling failed outgoing messages.
   * @param message The error message received.
   */
  onError(message: string): void {
    this.dialog.open(ErrorDialog, {
      data: {
        message: `An error occurred trying to send a message: "${message}"\n` +
          'If you continue to see this issue, you may need to whisper the bot directly, or your account might be too new.'
      }
    });
  }

  /**
   * Updates the user's settings.
   */
  updateSettings(): void {
    this.configManager.save();
    this.updateOverlayTheme();
  }

  /**
   * Toggles a widget on or off in the widget container.
   * @param widget The widget to toggle.
   */
  toggleWidget(widget: WidgetItem): void {
    if (widget && widget.name) {
      const index = this.config.layout.indexOf(widget.name);
      if (index >= 0) {
        this.config.layout.splice(index, 1);
      } else {
        this.config.layout.push(widget.name);
      }
      this.configManager.save();
    }
  }

  /**
   * Logs the user out of the app and re-initiates the authentication process.
   */
  logOut(): void {
    this.config.authentication = new ConfigAuthentication();
    this.configManager.save();
    this.router.navigate(['/']);
  }
}
