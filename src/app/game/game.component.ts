import { Component, OnInit, HostBinding } from '@angular/core';
import { Client, Options } from 'tmi.js';
import { Router } from '@angular/router';
import { UserService } from '../user/user.service';
import { ConfigManager } from '../data/config-manager';
import { IrcService } from '../irc/irc.service';
import { Config, ConfigSettings } from '../data/config-data';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
})
export class GameComponent implements OnInit {
  public config = new Config();
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
        this.ircService.Connect();
      } else {
        config.Authentication.Token = undefined;
        this.configManager.Save();
        this.router.navigate(['/']);
      }
    }
  }

  public ToggleTheme() {
    this.config.Settings.UseDarkTheme = !this.config.Settings.UseDarkTheme;
    this.configManager.Save();
  }
}
