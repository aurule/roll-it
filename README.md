# Roll It

Roll It is a Discord bot for rolling dice.

I made it because I wanted to run tabletop games over Discord, and there weren't any dice rollers that correctly implemented the roll mechanics I wanted to use. Since tallying dice by hand is annoying on a digital screen, I made Roll It to do it for me!

## Get Roll It

[Add Roll It](https://discord.com/oauth2/authorize?client_id=1037522511509848136) to your server using this link! It will request the absolute minimum permissions needed in order to work.

Once added, you'll automatically have access to all of its commands. You can learn how it works using the help system. A good place to start is the `Commands` topic, which you can reach using `/help topic:Commands`. Since you may not need to roll every kind of dice that Roll It supports, you can use  `/setup-roll-it` to pick which ones are available on your server.

## Features

Roll dice pools for a number of game systems:
* World of Darkness MET's rock-paper-scissors using `/met static` and `/met opposed`
* FATE fudge dice with `/fate`
* New World of Darkness / Chronicles of Darkness d10s with `/nwod`
* World of Darkness 20th Anniversary with `/wod20`
* Dungeons & Dragons 5e with `/d20`
* Don't Rest Your Head with `/drh`
* Kids On Bikes with `/kob`
* Shadowrun 4e, 5e, and 6e with `/shadowrun`

And of course, you can roll whatever standard dice you want:
* Roll some d6s with `/d6`
* Roll a d10 with `/d10`
* Roll a d20 with `/d20`
* Roll a percentile with `/d100`
* Roll other dice with `/roll`
* Do some dice math with `/roll-formula`

Most commands include some really helpful options:
* A `description` so you don't forget what you rolled for
* The `rolls` option to re-roll the same pool multiple times (great for hoards of baddies!)
* The `secret` option to keep the results to yourself
* A handy `until` option so you can easily see how many checks it takes to reach a goal

### Teamwork!

And a few commands like `/nwod`, `/shadowrun`, and `/wod20` have a special `teamwork` mode to let multiple people easily contribute to a shared roll. You can request specific helpers, and see who's added dice before you roll!

### Tables!

GMs can add random tables and roll on them to generate magic items, random encounters, and anything else! Check out `/help command:table` and `/help command:table add` to get started.

### Saved Rolls!

You can save a command and all its options to re-use later! Check out `/saved set` and `/help topic:Saved Rolls` to get started.

### Fun!

There are a few commands thrown in just for fun, too:
* Flip a coin with `/coin`
* Seek advice from the Magic 8 Ball with `/8ball`

## Getting Help

Roll It has a built-in help system through the command `/help`. Tell it a `command` to learn more about how a specific command works, or give it a `topic` to learn more about Roll It.

If the `/help` command doesn't answer your question, you can open a ticket on the [Roll It Github](https://github.com/aurule/roll-it). You'll have to be patient with responses, though!

## Giving Feedback

Got thoughts on something that works well, or that doesn't meet your needs? Have a dice system you'd like to see added to Roll It? Open a ticket on the [Roll It Github](https://github.com/aurule/roll-it)!

## Privacy

I take privacy pretty dang seriously. Roll It only requests permissions to accept slash commands (to roll the dice) and show custom emojis (to make the results of `/fate` all fancy). No message contents, no membership info, and nothing invasive.

# Development

## Contributions

I'm open to pull requests, but please be aware that this is mostly a personal project for fun.

If you want to make a PR, please make sure that the new code has 100% test coverage (you can run `yarn test` to find out) and clearly state what it adds or fixes. If you can't get 100% test coverage, explain in detail why that is.

## Requirements

* Node 18+
* Yarn 4

Roll-It currently uses Node 22.

## Dev Installation

1. Pull the repo
    1. Roll It makes use of Yarn's plug-n-play (pnp) feature, so you shouldn't need a separate install step after pulling. It's always safe to run `yarn` if you aren't sure.
2. Ensure the file `.env` has the correct environment variables. Especially double-check `DEV_GUILDS`.
3. Run `yarn run live`
4. Add Roll It to a discord server that you can spam for testing

## ENVVARS

* BOT_TOKEN: discord bot application token
* CLIENT_ID: ID of the bot's discord user
* NODE_ENV: one of "development", "test", "ci", or "production"
* DEV_GUILDS: a JSON array of discord server IDs that should respond to the bot when you run it locally (like `[ "guild_snowflake" ]`). It's important that these servers are private, or at least don't mind you spamming bot messages and breaking things.
* DEV_USERS: a JSON array of discord user IDs (like `[ "user_snowflake" ]`) to use when seeding certain database tables.
* LOG_LEVEL: the minimum level of log statements to display. Defaults to `"info"` in development and `"warning"` in test. Using `"debug"` will print all sql statements to the console, for example. See [Pino log levels](https://github.com/pinojs/pino/blob/main/docs/api.md#logger-level) for more detail.

## Working on Docs

The documentation is powered by [docsify](https://docsify.js.org/). To see them locally, you can use either the docsify cli, or python.

```sh
docsify serve docs
```

or

```sh
cd docs
python http.server 3000
```

## Versioning

Roll It uses [semantic versioning](https://semver.org/). In addition to the standard version increment rules, the minor version may be bumped for new commands.
