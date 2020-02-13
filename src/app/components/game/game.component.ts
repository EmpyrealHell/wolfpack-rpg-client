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
  public config = new Config();
  /**
   * Username from the validated token.
   */
  public username: string;
  /**
   * List of all widgets.
   */
  public widgets: Array<WidgetItem>;

  constructor(
    public ircService: IrcService,
    public configManager: ConfigManager,
    private userService: UserService,
    private widgetService: WidgetService,
    private overlayContainer: OverlayContainer,
    public dialog: MatDialog,
    public router: Router,
  ) { }

  public async ngOnInit(): Promise<void> {
    this.widgets = this.widgetService.getWidgets();
    const config = this.configManager.GetConfig();
    this.updateOverlayTheme();

    const token = config.Authentication.Token;
    if (!token) {
      this.router.navigate(['/']);
    } else {
      const userData = await this.userService.GetUserInfo(token);
      if (userData && userData.login) {
        config.Authentication.User = userData.login;
        this.configManager.Save();
        this.config = config;
        this.ircService.RegisterForError('game', (message) => { this.onError(message); }, true);
        this.ircService.Connect();
      } else {
        config.Authentication.Token = undefined;
        this.configManager.Save();
        this.router.navigate(['/']);
      }
    }
  }

  private updateOverlayTheme(): void {
    if (this.config.Settings.UseDarkTheme) {
      this.overlayContainer.getContainerElement().classList.add('dark-theme');
    } else {
      this.overlayContainer.getContainerElement().classList.remove('dark-theme');
    }
  }

  /**
   * Callback used for handling failed outgoing messages.
   * @param message The error message received.
   */
  public onError(message: string): void {
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
  public updateSettings(): void {
    this.configManager.Save();
    this.updateOverlayTheme();
  }

  /**
   * Toggles a widget on or off in the widget container.
   * @param widget The widget to toggle.
   */
  public toggleWidget(widget: WidgetItem): void {
    if (widget) {
      const index = this.config.Layout.indexOf(widget.name);
      if (index >= 0) {
        this.config.Layout.splice(index, 1);
      } else {
        this.config.Layout.push(widget.name);
      }
      this.configManager.Save();
    }
  }

  /**
   * Logs the user out of the app and re-initiates the authentication process.
   */
  public logOut(): void {
    this.config.Authentication = new ConfigAuthentication();
    this.configManager.Save();
    this.router.navigate(['/']);
  }
}
