# Wolfpack RPG Client Contribution Guidelines

## Introduction

### Welcome

If you're reading this, then you're thinking about making a contribution to the Wolfpack RPG Client. Thanks! This app is built and maintained by volunteers who want to support LobosJr and the community he has built. We wouldn't have this app without people like you.

This document contains a set of guidelines that will help you make sure that any work you do can be integrated into the application seamlessly. We know your time is valuable, and the last thing we want to do is annoy our potential contributors so much that they don't come back. Nobody wants to have to go back and forth for days on a PR.

By that same token, all of the managers of this project are volunteers. We have a limited amount of time to contribute, and following these guidelines means we can spend more of it improving the app.

### Contributions

As with any open-source project, we welcome many kinds of contribution. If you're an Angular developer, submitting bug fixes or more tests is a quick way to become one of our favorite people.

If you're not familiar with Angular, you can still help out! Writing detailed bug reports, helping find steps to reproduce bugs, or creating well-formed feature requests all help make this application better. If you think of any other way to help that isn't listed, we'd love to hear those too!

### Caveats

While we absolutely welcome the help of the community, there are some things that we're not really looking for. We would hate for you to put in a lot of work on something that we can't accept.

For bugs, new features, or design changes, make sure there is an issue describing the change tagged "help wanted" in the issue tracker. If there is not an issue linked to the PR with the "help wanted" tag, your PR won't be accepted until an issue is created and accepted. The only exceptions to this rule are spelling errors or simple grammar mistakes (like subject-verb agreement or verb tense agreement).

When submitting bugs, make sure to include a detailed description, including the version of the app and steps to reproduce. If you don't include those steps, your bug won't be accepted until you add them. This means that we won't address support questions through the issue tracker.

We aren't looking for bugs in self-hosted versions. If your bug can't be reproduced on the main [github pages site](https://empyrealhell.github.io/wolfpack-rpg-client), it won't be accepted.

We aren't looking for end-to-end tests, due to the reliance on the LobotJr accounting being present and responsive. Other types of test are fine, but if your test will fail when the bot isn't responding, we won't accept the PR.

## Expectations

### What You Need To Do

When communicating with managers, other contributors, end users, or anyone else through the github communication channels on this repository, the applicable rules from the LobosJr twitch channel apply.

1. Be respectful
2. If you're not sure if something should be posted, then ask a manager or don't
3. No harassment

Additionally, make sure you are communicating in clear, plain English. We understand that English is a second language for many people, that's absolutely not a problem. What is a problem is excessive use of slang, profanity, memes, or anything else that makes it difficult to understand for old, out of touch software engineers. Basically think of it like a paper for school, or a cover letter for a job application.

### Bug Reports

When submitting bugs to the issue tracker, make sure you include, at a minimum:

1. The version of the app you encountered the issue in
2. A description of what should have happened
3. A description of what actually happened
4. A list of steps to reproduce the issue

Since issues encountered in the client may be the result of issues with the Lobot code, it can also help to include your twitch username.

### Feature Requests

For feature requests or other enhancements, make sure you include, at a minimum:

1. A description of the current behavior that should change
2. A description of the new behavior being requested
3. An explanation of why the new behavior is an improvement

While it may seem obvious to you why your request makes the app better, it may not be obvious to the person approving it. If you don't have a specific idea of how to improve the current behavior, the request won't be approved. Ambigious requests, like "Make it better", don't help us and won't be approved.

### Pull Requests

When submitting a pull request, make sure you meet the following criteria:

1. All new behaviors have new tests to verify them
2. All new and existing tests pass
3. There are no GTS or other linting errors
4. Your pull request has a detailed description of the changes
5. Your pull request references a relevant issue in the issue tracker

You may be asked to make changes to your code as part of the code review process prior to your pull request being accepted. The pull request won't be approved until all suggestions have been addressed. If you don't agree with the suggestions, state your case in a calm rational manner.

## Our Commitment To You

### Etiquette

We will follow all of the same communication rules that we expect of you. If you encounter a manager or other contributor that violates these rules, please let the other managers know as soon as possible. That behavior will not be tolerated, and we are not exempt from that rule.

### Transparency

As part of our commitment to making this application open source, we will try to be as honest and transparent about our decisions at all times. If a bug, feature, or pull request is rejected, we will tell you why. If you don't understand, just ask and we will try to clarify. 

### Response Times

Since we are all volunteers, and have commitments outside of this project, we can't guarantee any specific time frame for responses. We try to review the list of issues at least every weekend. If you haven't gotten a response by then, or if it's an issue that needs a more timely response, try the [LobosJr Discord server](http://discord.gg/wolfpack), or reach out to the managers through their preferred contact method listed in [the readme](https://github.com/EmpyrealHell/wolfpack-rpg-client/blob/master/README.md).

## New Contributors

### Setup

To contribute a bug or feature request, the only setup you need is a github account. Before you can get started on your first code contribution, however, there's some setup you need to do.

1. Install the NPM and Node versions listed in [the readme](https://github.com/EmpyrealHell/wolfpack-rpg-client/blob/master/README.md)
2. [Create a fork of the repository](https://help.github.com/en/github/getting-started-with-github/fork-a-repo)
3. [Clone your forked repository to your local machine](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository)
3. [Install the project dependencies](https://docs.npmjs.com/cli/install)
4. Build and run the app to verify it works

### Your First Contribution

If this is your first pull request, this website can help guide you through that process: [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github).

For code contributions, check the [issue tracker](https://github.com/EmpyrealHell/wolfpack-rpg-client/issues) for items with the "help wanted" label. If you're new to the project, items with the "good first issue" label will be a good place to start.

Once you have your code done, make sure you add tests for the new code, and update any tests that were targeting code you modified. Having good tests is critical to making sure we can change the app with confidence, so make sure you've got good test coverage for your changes.

With all of that in place, double check that your tests all pass and you have no linting errors. Instructions on how to do that can be found in [the readme](https://github.com/EmpyrealHell/wolfpack-rpg-client/blob/master/README.md).

### Submitting A Pull Request

Once you're confident that your code is complete and everything checks out, it's time to create your pull request.

1. [Create a pull request from your fork](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request-from-a-fork)
2. [Write a good description](https://github.blog/2015-01-21-how-to-write-the-perfect-pull-request/) of the changes you've made
3. [Link the issue to your pull request](https://help.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue), if necessary
4. Keep an eye on your issue for review comments
5. Respond to each comment until all have been resolved

Once all comments have been resolved, your PR is ready to be accepted. A manager will complete the PR to have it merged into the main application.

### Additional Tips

Smaller PRs get reviewed faster. If you make changes to a large number of files, like cleaning up imports or changing line breaks, it makes the review process take much longer. Keep your PR as small as you can, by only including files that have changes relevant to the linked bug or feature request.

If you're making large changes to a class, like reorganizing things or moving parts around, it can cause confusion and make the merge process more complicated. If you included some refactor or reorganizing of the code, it can delay your response, and you may be asked to revert those changes.

## Adding Issues

### How To Report A Bug

When creating a bug report, copy the template below and fill it out in your bug description. If there is additional information, add it below the filled-out form. You can also attach screenshots or other helpful information if necessary.

    I encountered this bug on app version {version number}
    This was encountered on the main [github pages site](https://empyrealhell.github.io/wolfpack-rpg-client)

    What I was doing:
    {Description of the action you were attempting}

    What the app should have done:
    {Description of intended behavior}

    What the app actually did:
    {Description of bug behavior}

    Here are the steps to reproduce this bug:
    {List of steps to reproduce the bug}

After a manager reviews your bug, they will add labels or close the bug. You may be asked for more details, and if they aren't provided, the bug will eventually be closed.

### How To Suggest An Enhancement

When creating a feature request or enhancement, copy the template below and fill it out in your issue description. If there is additional information, add it below the filled-out form. You can also attach screenshots, mock ups, or other information if necessary.

    How the app currently works:
    {Description of the behavior you want to change}

    How it should work:
    {Description of the new behavior you are requesting}

    Why it's an improvement:
    {Explain what makes it better, which type of user will be affected, etc...}

After a manager reviews your enhancement suggestion, they will add labels or close the issue. You may be asked for more details, and if they aren't provided, the request will eventually be closed.

## Community

### Game Community

The main community that surrounds the game underlying this app is the [LobosJr twitch community](https://www.twitch.tv/lobosjr). You can play the game there using the Twitch whisper system, in addition to using this app.

The [LobosJr Discord server](http://discord.gg/wolfpack) is another area where the community congregates. While you can't play the Wolfpack RPG through the Discord server, you can chat with other members of the community when LobosJr isn't streaming.

### Development Community

The preferred contact method for each of the application managers is listed in [the readme](https://github.com/EmpyrealHell/wolfpack-rpg-client/blob/master/README.md). This is the fastest way to get ahold of someone about the application.

Due to the small size of the team, there isn't a channel in the Discord server at this time.
