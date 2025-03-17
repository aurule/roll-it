# Dice Systems

Roll It has commands to roll dice for various game systems, in addition to plain dice (see the [Generic section](/systems/generic)).

Since Roll It has commands for so many dice systems, you should use the `/setup-roll-it` command to pick which ones are available on your server. This command is only available to server managers by default, but they can change that as they want.

Here are the supported systems:

* [Chronicles of Darkness](/systems/nwod) (2e and 1e, aka New World of Darkness) d10s with `/nwod`
* [Don't Rest Your Head](/systems/drh) with `/drh`
* [Dungeons & Dragons 5e](/systems/dnd5e) with `/d20` or `/curv`
* [FATE](/systems/fate) fudge dice with `/fate`
* [FFRPG](/systems/ffrpg) (3rd edition) percentiles for Final Fantasy with `/ffrpg`
* [Kids On Bikes](/systems/kob) with `/kob`
* [Powered by the Apocalypse](/systems/pba) with `/pba`
* [Shadowrun](/systems/shadowrun) 4e, 5e, and 6e with `/shadowrun`
* [Stars Without Number](/systems/swn) with `/d20` and `/2d6`
* [World of Darkness 20th Anniversary](/systems/wod20) with `/wod20`
* [World of Darkness MET](/systems/met) rock-paper-scissors using `/met static` and `/met opposed`

## Common Options

Each command has its own options to specify things like the number of dice, how many sides they have, or system-specific rules. They all also have the following shared options:

* `description` lets you say a few words about the roll, to keep track of it later
* `rolls` lets you repeat the same roll multiple times all at once
* `secret` hides the roll result from everyone but you
