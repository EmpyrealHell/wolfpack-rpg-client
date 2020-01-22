import { Component, OnInit, HostBinding } from '@angular/core';
import { Client, Options } from 'tmi.js';
import { Router } from '@angular/router';
import { UserService } from '../user/user.service';
import { ConfigManager } from '../data/config-manager';
import { IrcService } from '../irc/irc.service';
import { Config } from '../data/config-data';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
})
export class GameComponent implements OnInit {
  private config: Config;
  private username: string;

  constructor(
    public ircService: IrcService,
    public configManager: ConfigManager,
    public userService: UserService,
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
        this.username = userData.login;
        this.Connect(userData.client_id, this.username, token);
      } else {
        config.Authentication.Token = undefined;
        this.configManager.Save();
        this.router.navigate(['/']);
      }
    }
  }

  public Send(command: string) {
    this.connection.whisper('lobotjr', command);
  }

  public TypeCommand(command: string) {
    this.command = command;
  }

  public SendCommand() {
    this.Send(this.command);
    this.command = '';
  }

  public OnKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.SendCommand();
    }
  }

  public ToggleTheme() {
    this.darkTheme = !this.darkTheme;
    this.configManager.GetConfig().Settings.UseDarkTheme = this.darkTheme;
    this.configManager.Save();
  }

  public Connect(client: string, user: string, token: string): void {
    const options = {
      options: {
        clientId: client,
      },
      connection: {
        server: 'irc-ws.chat.twitch.tv',
        port: 443,
        reconnect: true,
        secure: true
      },
      identity: {
        username: user,
        password: `oauth:${token}`
      },
      channels: [
        'jtv'
      ],
      logger: {
        error: () => this.Error,
        warn: () => this.Warning,
        info: () => this.Info
      }
    } as Options;

    this.connection = Client(options);
    this.connection.on('whisper', (from, userstate, message, self) => {
      console.log(message);
      if (!self) {
        this.lines = [...this.lines, message];
        this.consoleData += `${message}\n`;
      }
    });
    this.connection.connect().then((value) => {
      this.connection.whisper('lobotjr', '!stats');
      this.isConnected = true;
    }, (error) => {
      console.log('Error!');
      console.log(error);
    });
  }

  public Error(message: string): void {
    this.Log(`ERROR: ${message}`);
  }

  public Warning(message: string): void {
    this.Log(`Warning: ${message}`);
  }

  public Info(message: string): void {
    this.Log(`Info: ${message}`);
  }

  public Log(message: string): void {
    console.log(message);
  }
}
