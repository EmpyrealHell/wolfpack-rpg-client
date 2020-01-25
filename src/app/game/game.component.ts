import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Config } from '../data/config-data';
import { ConfigManager } from '../data/config-manager';
import { IrcService } from '../irc/irc.service';
import { UserService } from '../user/user.service';

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

  constructor(
    public ircService: IrcService,
    private configManager: ConfigManager,
    private userService: UserService,
    private router: Router,
  ) { }

  public async ngOnInit(): Promise<void> {
    const config = this.configManager.GetConfig();

    const token = config.Authentication.Token;
    if (!token) {
      this.router.navigate(['/']);
    } else {
      const userData = await this.userService.GetUserInfo(token);
      if (userData && userData.login) {
        config.Authentication.User = userData.login;
        this.configManager.Save();
        this.config = config;
        this.ircService.Connect();
      } else {
        config.Authentication.Token = undefined;
        this.configManager.Save();
        this.router.navigate(['/']);
      }
    }
  }

  /**
   * Toggles the theme between light and dark.
   */
  public toggleTheme() {
    this.config.Settings.UseDarkTheme = !this.config.Settings.UseDarkTheme;
    this.configManager.Save();
  }

  /**
   * Toggles a widget on or off in the widget container.
   * @param id The id of the widget to toggle, which must match a key in the widget service.
   */
  public toggleWidget(id: string) {
    const index = this.config.Layout.indexOf(id);
    if (index >= 0) {
      this.config.Layout.splice(index, 1);
    } else {
      this.config.Layout.push(id);
    }
    this.configManager.Save();
  }
}
