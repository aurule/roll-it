# Roll It bot

Roll It is a Discord bot for rolling dice.

## Get Roll It

TBD

## Features

In Development

## Getting Help

TBD

## Giving Feedback

TBD

## Privacy

I take privacy pretty dang seriously! Roll It does not request permission to do anything besides accept slash commands to roll dice. No message contents, no user lists, nothing invasive.

# Development

## Requirements

Node 18+

## Dev Installation

run `npm install`
ensure DEV_GUILDS is correct

## ENVVARS

* BOT_TOKEN: discord bot application token 
* REDIS_URL: URL of the redis instance to use 
* NODE_ENV: one of "development", "test", "ci", or "production"
* CLIENT_ID: ID of the bot's discord user 
* DEV_GUILDS: [ "guild_snowflake" ] 

## Versioning

Roll It uses [semantic versioning](https://semver.org/). In addition to the standard version increment rules, the minor version may be bumped for new commands and database changes.

## Deployment

* copy code 
* run `npm install` 
* run `npm run commands:deploy-globals` 
* run `npm run commands:deploy-guilds` 
* restart daemon (`node index.js`)
