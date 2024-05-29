# Roll It

Roll It is a Discord bot for rolling dice.

I made it because I wanted to run tabletop games over Discord, and there weren't any dice rollers that correctly implemented the roll mechanics I wanted to use. Since tallying dice by hand is annoying on a digital screen, I made Roll It to do it for me!

## Get Roll It

[Add Roll It](https://discord.com/oauth2/authorize?client_id=1037522511509848136) to your server using this link! It will request the absolute minimum permissions needed in order to work.

Once added, you'll automatically have access to all of its commands. You can see what's available with the help system through `/roll-help topic:Commands`. If you only want to keep a few roll commands, you can use `/roll-chooser` to pick which ones are available on your server.

## Features

Roll dice pools for a number of game systems:
* World of Darkness MET's rock-paper-scissors using `/chop`
* FATE fudge dice with `/fate`
* New World of Darkness d10s with `/nwod`
* World of Darkness 20th Anniversary with `/wod20`

Roll some fun things, too!
* Flip a coin with `/coin`
* Seek advice from the Magic 8 Ball with `/eightball`

And of course, you can roll whatever dice you want:
* Roll some d20s with `/d20`
* Roll other dice with `/roll`
* Do some dice math with `/roll-formula`

Most commands include some really helpful features:
* The `rolls` option to re-roll the same pool multiple times (great for hoards of baddies!)
* The `secret` option to keep the results to yourself
* A handy `until` option so you can easily see how many checks it takes to reach a goal

Finally, Roll It has a built-in help system through the command `/roll-help`. Tell it a `command` to learn more about how a specific command works, or give it a `topic` to learn more about Roll It.

## Getting Help

If the `/roll-help` command doesn't answer your question, you can open a ticket on the [Roll It Github](https://github.com/aurule/roll-it). You'll have to be patient with responses, though!

## Giving Feedback

Got thoughts on something that works well, or that doesn't meet your needs? Have a dice system you'd like to see added to Roll It? Open a ticket on the [Roll It Github](https://github.com/aurule/roll-it)!

## Privacy

I take privacy pretty dang seriously! Roll It does not request permission to do anything besides accept slash commands to roll dice. No message contents, no user lists, nothing invasive.

# Development

## Contributions

I'm open to pull requests, but please be aware that this is mostly a personal project for fun.

If you want to make a PR, please make sure that the new code has 100% test coverage (you can run `yarn test` to find out) and clearly state what it adds or fixes. If you can't get 100% test coverage, explain in detail why that is.

## Requirements

* Node 18+
* Yarn 4

Roll-It currently uses Node 22.

## Dev Installation

1. pull the repo
2. ensure the file `.env` has the correct environment variables. Especially double-check `DEV_GUILDS`.
3. run `yarn run live`
4. add Roll It to the discord server that you can spam for testing

If you're developing on Windows, yarn will need to tweak some of its files. Do not commit these! The repo is aimed at \*nix systems.

## ENVVARS

* BOT_TOKEN: discord bot application token
* NODE_ENV: one of "development", "test", "ci", or "production"
* CLIENT_ID: ID of the bot's discord user
* DEV_GUILDS: a list of discord server IDs that should respond to the bot when you run it locally (like `[ "guild_snowflake" ]`). It's important that these servers are private, or at least don't mind you spamming bot messages and breaking things.
* LOG_LEVEL: usually `"debug"` for development

## Versioning

Roll It uses [semantic versioning](https://semver.org/). In addition to the standard version increment rules, the minor version may be bumped for new commands.

## Deployment

* copy repo
* If global commands have changed, run `yarn run commands:deploy-globals`
* restart daemon with `pm2 reload`
