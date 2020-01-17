import { Component, OnInit, OnDestroy } from '@angular/core';
import { Client, Options } from 'tmi.js';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../user/user.service';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['../app.component.css']
})
export class GameComponent implements OnInit {
    public static targetAccount = 'lobotjr';
    public connection: Client;

    public isConnected = false;

    public lines: Array<string> = [];
    public command = '';

    constructor(public authService: AuthService, public userService: UserService, private router: Router) { }

    public ngOnInit(): void {
        const token = this.authService.GetAuthData().Token;
        if (!token) {
            this.router.navigate(['/']);
        } else {
            this.userService.GetUserInfo(token).subscribe((userData) => {
                if (userData && userData.login) {
                    this.Connect(userData.client_id, userData.login, token);
                }
            }, (error) => {
                console.log(error);
            });
        }
    }

    public Send(event: KeyboardEvent) {
        if (event.key === "Enter") {

            this.connection.whisper('lobotjr', this.command);
            this.command = '';
        }
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
            if (!self) {
                this.lines.push(message);
            }
        });
        this.connection.connect().then((value) => {
            // console.log(value);
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
