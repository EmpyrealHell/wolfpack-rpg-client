# Wolfpack Rpg Client

An angular web app that acts as a client for interacting with the Wolfpack RPG. The Wolfpack RPG was developed by Twitch streamer LobosJr, as part of the custom bot he wrote. This app was developed for and in collaboration with LobosJr, to act as the official client for the game to get around the issues with the Twitch whisper system.

[The Wolfpack RPG code](https://github.com/lobosjr/lobotjr)

## Running the Client

The app is hosted on Github, and requires a Twitch account to log in. The app communicates directly with LobotJr, and as such will not work if that bot is not running in the LobosJr channel.

If your Twitch account is still new, you may not be able to send messages through a stand-alone client. This is due to a security measure Twitch takes against spam bots. Twitch will not say how long an account must be active before this feature is enabled.

[Launch the client](https://empyrealhell.github.io/wolfpack-rpg-client/)

## Development Requirements

This app was created using [Angular CLI](https://github.com/angular/angular-cli) CLI 8.3.22. It requires Node 8.9 or higher, and NPM 5.5.1 or higher.

## Building Locally

Before attempting to build the app locally, make sure you have installed all development requirements and cloned this repository.

In the repository root folder, run the start NPM command.

    NPM run start

This will build the application and host it locally. Once it's finished compiling, you can access the app at `http://localhost:4200/`. Since this is an Angular project, it will detect changes in the code and update the server automatically as long as the command is still running.

## Running the tests

To run the unit tests for this project, run the test NPM command.

    NPM run test

To run the style tests for this project, run the check NPM command.

    NPM run check

Due to the dependency on Lobot being up and running, there are no e2e tests. Additional focus is placed on unit testing to compensate.

## Deployment

For deployment of a local version, run the deploy NPM command. This will create a dist folder containing everything you need to host the app.

    NPM run deploy

To update the main app hosted on Github, run the deploy-to-ghpages NPM command.

    NPM run deploy-to-ghpages

Note that only authorized users are able to publish to the Github-hosted page.

## Built With

- [Angular](https://angular.io/) - The web framework used
- [NPM](https://www.npmjs.com/) - Dependency management
- [GTS](https://github.com/google/gts) - Style guide and linter

## IDE and Extensions

We recommend using [Visual Studio Code](https://code.visualstudio.com/) with the following extensions:

- [TSLint](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-tslint-plugin)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

Make sure to set your default formatter to use Prettier, as the default typescript formatter in VS Code will cause conflicts with the GTS style check.It is listed in the formatter selection as esbenp.prettier-vscode.

## Contributing

Please read [CONTRIBUTING.md](https://github.com/EmpyrealHell/wolfpack-rpg-client/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/EmpyrealHell/wolfpack-rpg-client/tags).

## Authors

- **[LobosJr](https://twitch.tv/LobosJr)** - _Lead Designer_
- **[EmpyrealHell](https://github.com/EmpyrealHell)** - _Lead/Primary Developer_

See also the list of [contributors](https://github.com/EmpyrealHell/wolfpack-rpg-client/contributors) who participated in this project.

## License

This project is licensed under the GPL 3.0 License - see the [LICENSE.md](https://github.com/EmpyrealHell/wolfpack-rpg-client/blob/master/LICENSE.md) file for details
