# Version History

These are the change logs for Roll It, from newest to oldest. You can also find these in the bot itself using [`/help topic:changes` invocation].

## v1.13.2 <small>Released Nov 14, 2025</small>

### Changed

* The `/d20` command now always shows the die that was rolled
* The *Report this roll...* command no longer works for banned users
* The modal for _Save this roll..._ now shows the invocation and changeable options of the saved command

### Fixed

* Paginated messages no longer break inline formatting
* Teamwork expiry no longer gets confused by timezones other than UTC

## v1.13.1 <small>Released Nov 4, 2025</small>

### Fixed

* Using an unauthorized component correctly shows a message instead of erroring out

## v1.13.0 <small>Released Oct 25, 2025</small>

This release features several new rollers and a completely overhauled interactive experience for `/met opposed`.

### Added

* New `/d12` roller
* New `/d4` roller
* The `/swn` roller can now re-roll 1s
* Added `pool` to `/d10` and `/d100` rollers
* Add links to the teamwork feature guide to `/nwod`, `/wod20` and `/shadowrun` command help

### Changed

* Complete rewrite of `/met opposed` to be more powerful and resilient
    - As a result, `/met opposed` now has much simpler options
* `/swn` results now always show the dice pool
* Improved how messages are sent to work around spurious "Bot failed to respond" errors from Discord
* Converted most messages to use Discord components v2

### Fixed

* Command listings in help topics are sorted properly
* The list of commands now shows correct descriptions for context commands like _Report this roll_
* You can now save `/d6` and `/d8` commands with a `pool` more than 1
* Math and syntax errors in `/formula` now show the error description instead of crashing
* Helpers can now reply to the very first help requested message
* Teamwork mode allows helpers to add more than 9 dice

## v1.12.0 <small>Released May 9, 2025</small>

This release completely overhauls the way teamwork tests are handled for `/nwod`, `/shadowrun`, and `/wod20`. It should be much more resilient against Discord's flakyness, as well as clearer and easier to use.

### Added

* New teamwork handling for `/nwod`, `/shadowrun`, and `/wod20`
* Roll It can now respond to mentions and replies
* New `/d8` roller
* More sacrificial fun
* Performance logging to investigate intermittent failures

### Changed

* Renamed `/roll-formula` to `/formula`
* Allow `/table` commands to be used by all users

### Fixed

* The `/chop` command accepts descriptions again

## v1.11.1 <small>Released Mar 30, 2025</small>

### Fixed

* The `avoid` modifier to `/ffrpg` now has the correct sign
* Fixed field labels not appearing for *Report this roll* modal
* Using `1D6` instead of `1d6` in `/roll-formula` no longer crashes the roller

## v1.11.0 <small>Released Mar 21, 2025</small>

This release dramatically improves the experience of saving a roll. Check out the [saved rolls guide](https://aurule.github.io/roll-it/#/features/saved), in-app help, or just dive in with the *Save this roll* command from the right-click menu.

### Added

* New `/ffrpg` roller for the *Final Fantasy RPG 3e* system
* Added `carrier` and `altering` flags to `/met opposed` roller

### Changed

* Use server locale for teamwork and met-opposed
* Reworked Saved Rolls to use a popup window to get the name and description for a new roll, instead of a separate command
* Saved rolls no longer have the confusing `incomplete` state. Roll It now shows a popup for setting the name and description.

### Removed

* `/saved set` has been replaced by better interactivity in *Save this roll*

### Fixed

* Stopped the hummingbird from crashing `/nwod` and `/wod20`
* Saved rolls list would always claim you had one roll, even with multiple listed
* Saved rolls list did not translate shared options

## v1.10.2 <small>Released Feb 25, 2025</small>

### Added

* If your luck is bad, try sacrificing a goat!
* Can you spot the hummingbird?
* I'm a potato.

### Changed

* Italicize called result for `/coin`

### Fixed

* Fixed bug where some rollers could not return the maximum result
* Fixed `/pba` ignoring user locale

## v1.10.1 <small>Released Feb 13, 2025</small>

### Added

* `/drh` now allows rolling discipline to help another, using `pain:0`
* `/drh` now supports a `modifier` to add automatic successes from helpers
* `/setup-roll-it` now lets you pick commands by game system as well as individually

### Changed

* Replaced basic random number generator with mathJS, improving randomness of roll results
* New timeout message when you run out of time while editing table or saved roll
* Saved roll invocations are now shown in the user's own locale

### Fixed

* Commands that fail due to Discord dropping its connection should no longer block other commands
* `/met opposed` correctly handles new structure for getting message interactions
* Single-die rollers no longer show an empty description

## v1.10.0 <small>Released Jan 26, 2025</small>

### Added

* New `/d6` command to roll 1d6
* New `/pba` command to support Powered by the Apocalypse and Stars Without Number
* New `/swn` command for rolling skills in Stars Without Number and its sister systems

### Changed

* `/curv` now calls out crit fails as well as crit successes
* Make `/chop` shortcut message less insistant
* Stop showing when a user chop is random
* Use :memo: instead of :warning: for incomplete saved rolls
* Improvements to response clarity. This is part of an ongoing effort to make Roll It available in multiple languages. If you would like to help translate in the future, please drop a line on github or by using `/help feedback`!

### Removed

* Roll It no longer tries to send a welcome message when it's added to a server

### Fixed

* Change off of recently deprecated Discord APIs
* Normalized how dice results are displayed
* Exhaustion talens for `/drh` no longer error on missing Madness dice
* Cleaned up some typos in the `/drh` results
* Fixed crash that could happen when confirming new commands with `/setup-roll-it`

## v1.9.6 <small>Released Dec 20, 2024</small>

### Added

* Output for `/met static` and `/chop` now tag each roll as random or with bomb

### Changed

* Renamed `/eightball` command to `/8ball`
* Rework `/chop` as a simplified shortcut to `/met static`

## v1.9.5 <small>Released Nov 12, 2024</small>

### Changed

* Renamed `/roll-chooser` to `/setup-roll-it`
* Increases the response timer for `/met opposed` from 5 to 10 minutes
* Require both participants to click Throw during a retest in `/met opposed`
* Show new rps chop emoji when a throw is confirmed in `/met opposed` retests

### Fixed

* The prompt to cancel a retest during `/met opposed` should work again
* Retest reason is now saved per user, so you won't accidentally retest using the other participant's reason

## 1.9.4 <small>Released Oct 23, 2024</small>

### Fixed

* Message from `/roll-chooser` is back to only being visible to the command's user
* Teamwork mode properly tallies helper results and correctly rolls the final pool for nwod
* Docs: Incorrect url in one of the changelog notes
* Docs: Fixed typo in changelog notes for 1.9.3

## 1.9.3 <small>Released Oct 16, 2024</small>

### Added

* The `/chop` command now shows a deprecation message
* Docs: Added version history to the website

### Changed

* Made wording of the final message clearer when the defender wins in `/met opposed`

### Fixed

* Slow API responses from Discord will no longer cause `/roll-chooser` to fail
* Added missing timeout notices to cancel and retest prompts in `/met opposed`
* Expired timers are all hidden now in `/met opposed`


## 1.9.2 <small>Released Oct 8, 2024</small>

### Added

* New `/help feedback` command to send me your feedback
* There's now a link to [support me on Ko-fi](https://ko-fi.com/paige2501)
* The prompt to respond to `/met opposed` now explains that you have to declare bomb and ties

### Changed

* Each result in `/met opposed` now shows the chop of that test's leader first. Hopefully this will reduce confusion.

### Fixed

* Added deprecation notice to the help for `/chop`
* Docs: Added [migration guide](/systems/met?id=migrating-to-met-static) for moving from `/chop` to `/met static` on the website
* Opposed MET tests no longer ignore [`use-retests:False` invocation]
* Followup messages in `/met opposed` now time out properly

## 1.9.1 <small>Released Oct 2, 2024</small>

Maintenance release.

### Additions

* Added deprecation notice to the help for `/chop`
* Docs: Added [translation guide](/systems/met?id=migrating-to-met-static) from `/chop` to `/met static`

### Fixed

* Followup messages in `/met opposed` now time out properly

## 1.9.0 <small>Released Oct 2, 2024</small>

Want to play real rock-paper-scissors in Discord? Guess what! There's now a command for it! Choose what you throw, declare ties, retests, etc. all within the command, and directly challenge your opponent!

### Added

* New `/met static` and `/met opposed` commands for better handling of MET rules
* The `/curv` roller now calls out critical results

### Changed

* Deprecated `/chop` in favor of `/met opposed`. Once the `/met` commands are field tested and stable in a future update, `/chop` will be removed.
* `Save this roll` now uses locally cached data, since Discord no longer sends command names

## 1.8.0 <small>Released Sep 13, 2024</small>

### Added

* New `/curv` roller to use 3d6 in place of a d20 for D&D 5e

### Changed

* Docs: Note that you can't save secret rolls

### Fixed

* it's no longer possible to attempt to save a command from another bot, even if it looks the same

## 1.7.2 <small>Released Sep 7, 2024</small>

### Added

* New `decreasing` option for `/nwod` roller to lower pools on each re-roll, as for retrying actions
* Docs: Sample tables are now available on the Tables page
* Docs: New image examples on the Saved Rolls page to make things clearer

### Changed

* Use strikethrough for 1s in `/shadowrun` output to match existing convention
* Docs: Command examples are easier to read

### Fixed

* Output of `/nwod` correctly displays when `rote` has re-rolled a 1 on the first die of a normal pool
* The `/saved add` command recognizes text files again. Discord changed something 🤷‍♀️
* Output of `/nwod`, `/shadowrun`, and `/wod20` now shows the max number of rolls when `until` is set
* Saving `/nwod`, `/shadowrun`, and `/wod20` rolls no longer ignores the max rolls when `until` is set

## 1.7.1 <small>Released Sep 3, 2024</small>

### Added

* New website!
* Allow teamwork rolls for `/nwod` to use the `rote` benefit

### Changed

* Add more links to the About Roll It `/help` topic
* Emojis for `/fate` results are now application-specific and not tied to a server
* Made the `/roll` command globally available
* Roll It will no longer add all commands when invited to a new server.
* Added a note about teamwork tests for different versions of Shadowrun

### Fixed

* Remove extra newlines between pools in the `/roll-formula` output
* Teamwork rolls for `/nwod` were ignoring the `threshold` option
* The `/wod20` roller no longer shows a botch when successes were scored, but there were more 1s than successes

## 1.7.0 <small>Released Aug 28, 2024</small>

### Added

* Support for [Don't Rest Your Head](/systems/drh) with the `/drh` command
* Support for [Kids On Bikes](/systems/kob) with the `/kob` command
* Support for [Shadowrun](/systems/shadowrun) 4e, 5e, and 6e with the `/shadowrun` command
* Made it easier to make small changes to a saved roll with the new `/saved grow` command
* New help topic to show implemented dice systems

### Changed

* Allow `/saved roll` to add the bonus to any attribute supported by the command
* The bonus from `/saved roll` is now shown in the roll's description
* Updated pagination message number to use subtext formatting
* Renamed the `keep` option for `/d20` to `with`, specifying advantage or disadvantage

### Fixed

* The Commands help topic no longer shows an error

## 1.6.2 <small>Released Aug 19, 2024</small>

### Added

* Output of `/saved manage` now shows instructions for how to fix an invalid or incomplete roll

### Changed

* Improve error reporting for failed commands
* Make it clear that your roll is ok to use after clicking "Stop Editing" with a valid roll in `/saved manage`

### Fixed

* Fixed rare bug where editing a saved roll might not mark the roll as finished
* Output of `/saved manage` no longer shows the description twice
* `/saved list` uses the correct command names in its instructions when you have no saved rolls
* Autocomplete will show options even when Discord fails to send text

## 1.6.1 <small>Released Aug 16, 2024</small>

### Added

* Dice in `/roll-formula` can now have labels, like `1d8 + 1d6"fire" + 4`
* `/saved list` now shows a legend to explain the symbols used for incomplete and invalid rolls
* New, comprehensive guide to using saved rolls

## 1.6.0 <small>Released Aug 9, 2024</small>

There's a brand new big feature! Roll It now supports [**Saved Rolls**](/features/saved)! By using some new commands, you can save a commonly-used roll -- complete with its pool, modifier, and all the other options -- and re-use it later. You can even tweak the saved options with a `bonus` when you roll. Check out the help text for `/saved` using [`/help command:saved` invocation] or jump right in with `/saved set`!

This feature makes use a new kind of command for Roll It: the message context command. Instead of typing a slash followed by the command name, you right click a message (on desktop) or long press a message (on phone/tablet), then select `Apps` and finally `Save this roll`. It's a pretty convenient way to save a command you've just used.

## Added

* New `/saved` family of commands to manage saved rolls
* New `/d10` command to quickly roll a single ten-sided die
* Added `rolls` option to `/roll-formula` for repeated rolls
* Show explicit "with advantage" or "with disadvantage" to `/d20` rolls where `keep` was specified

## Changed

* Rename the `/d20` command's `advantage` option to `keep`
* Added limits to rolls, until, and dice pools:
    - Rolls are capped at 100
    - Until is capped at 100
    - Pools are capped at 1000
* Added 1500 char limit to description and `/roll-formula` formula

## Fixed

* Added missing description of the `keep` advantage option in the help text for `/d20`
* Prevent errors during table selection when there are more than 25 tables
* Negative modifiers are now formatted more naturally

## 1.5.0 <small>Released Jul 15, 2024</small>

### Added

* Roll It now supports rolling [results on a table](/features/tables)! Check out the new `/table` family of commands to try it out.
* The help text for `/help` now shows all available commands

### Changed

* The `/roll-help` command is now just `/help`
* Command names for `/help` command now use autocomplete instead of a static list
* Improved handling of autocompletion
* Help text for commands with subcommands use the proper label
* Complete refactor of subcommand handling for faster handling and development

### Fixed

* URL to read more changelogs works again

## 1.4.2 <small>Released Jun 18, 2024</small>

### Added

* You can now call heads or tails for your `/coin` toss with the `call` option
* Roll It now shows a status message

### Changed

* The `until` option for `/nwod` now works when you have a chance die (a pool of zero). It's probably a bad idea IC, but you can roll it!

### Fixed

* The `/nwod` command now shows "a chance die" instead of a pool of "1" when rolling a chance die
* Error when trying to display too many results
* Improved where long help messages get broken into pages
* The results for `/nwod` now correctly pluralize "die" and "dice"
* The results for an `/nwod` chance die with rote now show "10!!" when the first die is a success

## 1.4.1 <small>Released Jun 12, 2024</small>

### Added

* Advantage and disadvantage for the `/d20` command
* Chance die handling for `/nwod` when the dice pool is zero
* Handling for rote rolls in `/nwod` with a new `rote` option
* The `/roll-chooser` command now shows which commands are currently available

### Changed

* Improved how `/roll-chooser` handles instances when the commands are not changed
* Moved description option higher up for all commands to increase visibility
* The result from `/roll-formula` now displays the formula using inline code markup to avoid incorrect automatic formatting
* Made `/roll-help` clearer to use

### Fixed

* Improved how commands are loaded to make `/roll-chooser` and `/roll-help` more responsive

## 1.4.0 <small>Released May 27, 2024</small>

### Added

* New `/d100` command to roll percentiles
* Teamwork tests now show contributions as they're added
* Teamwork leaders can now request specific people to help with their test

### Changed

* Teamwork results now link to the prompt message
* Updated teamwork bonus descriptions

### Fixed

* Teamwork summary keeps bonuses next to usernames on mobile

## 1.3.2 <small>Released May 17, 2024</small>

### Changed

* Teamwork rolls now roll on timeout instead of cancelling

## 1.3.1 <small>Released May 17, 2024</small>

### Added

* New teamwork mode for `/nwod` and `/wod20` commands

### Changed

* Added buttons to the `/roll-chooser` command so it's clearer what action will happen

## 1.3.0 <small>Released Dec 6, 2023</small>

### Added

* New `/roll-chooser` command

### Changed

* Move most commands from global to server namespace

### Removed

* Remove unneeded dependency

## 1.2.0 <small>Released Mar 8, 2023</small>

### Added

* New /d20 command

### Changed

* Allow multiple rolls for the /chop command

## 1.1.2 <small>Released Feb 23, 2023</small>

### Changed

* Update dependencies
* Move roll results ahead of descriptions

## 1.1.1 <small>Released Jan 6, 2023</small>

### Added

* New `/eightball` command

## 1.1.0 <small>Released Nov 16, 2022</small>

This release features the new `/roll-formula` command! With `/roll-formula`, you can roll many different dice at once and do some wild math with them. Enjoy!

### Added

* New `/roll-formula` command
* Available commands help topic

### Changed

* Made command help text more consistent

## 1.0.1 <small>Released Nov 11, 2022</small>

### Added

* Available commands help topic

## 1.0.0 <small>Released Nov 9, 2022</small>

This is the official stable release! Most planned rollers have been implemented and all are stable. Enjoy!

## Added

* `/nwod` dice roller
* `/wod20` dice roller

## 0.9.0 <small>Released Nov 5, 2022</small>

This is the first public release of Roll It!

Most of the planned commands have been implemented and more are still to come. So far, here's what's available:

`/chop` - Play a round of rock-paper-scissors
`/coin` - Flip a coin
`/fate` - Roll four fudge dice
`/roll` - Roll some dice

You can get help with any of these, or about certain topics, using the `/roll-help` command. Have fun!
