# Saving Rolls

Most rolls can be saved for later re-use by giving them a name and a description. This is done using the `/saved` family of commands. Here's a primer on how the whole thing works, as reproduced from the output of [`/help topic:Saved Rolls` invocation].

# Saving a Roll

When you need to use a complicated roll over and over again, Roll It can save that roll so you don't have to type out (and remember) the whole thing each time. In order to save a roll, you need three parts:

1. A name for the saved roll. This is how you will find it if you save more than one, so the name has to be unique.
2. A description for the saved roll. This should describe what the roll does, and will be shown as the default description each time you use that saved roll.
3. The command and its options. Roll It gets these automatically, so you don't have to type them in.

In order to save all this, Roll It uses a context command called *Save this roll*. When you run it on a roll result message, it will prompt you for the name and description for your new roll. Once it's saved, you can use it!

_Save this roll_ is the first context command in Roll It, so it might need some explaining. A context command is a bot action that is not typed out, but is used through a menu within Discord. To get to that menu, you need to take different steps depending on whether you're using Discord on your phone or on a computer. With a phone, you long-press on a message to show the menu. On a computer, you right-click the message. Once that context menu shows up, you select the `Apps` item and a smaller menu opens up. That's where you can find _Save this roll_.

![Discord message context menu showing the Apps submenu highlighted, and the Save this roll option highlighted](../_images/examples/save-this-roll.png)

#> For an example, let's say you used [`/roll pool:2 sides:6` invocation] and Roll It replied with `@you rolled 9 (2d6: [5,4])`. By long pressing or right clicking on `@you rolled 9 (2d6: [5,4])`, you select `Apps` and then _Save this roll_. Roll It reads the message and determines that you used the `/roll` command with a `pool` of 2 and `sides` of 6. It saves that, and shows a window asking you to give it a name and description. Once you do, you can use your roll!

![Discord showing a modal window where the name and description can be entered for a new saved roll](../_images/examples/save-this-roll-result.png)

?> Not all commands can be saved. Some do not roll actual dice (like `/table roll` or `/help`), don't have re-usable options (like `/coin`), or are so simple that it's more effort to use a saved roll than to just use the options.

Here are the commands that can be saved:
* `/curv` - Roll 3d6 for [D&D 5e](/systems/dnd5e)
* `/d10` - Roll a single ten-sided die
* `/d100` - Roll a single percentile (100-sided) die
* `/d20` - Roll a single 20-sided die
* `/d6` - Roll some six-sided dice
* `/d8` - Roll some eight-sided dice
* `/drh` - Roll pools of d6s for [Don't Rest Your Head](/systems/drh)
* `/fate` - Make a [FATE](/systems/fate) roll of four fudge dice
* `/ffrpg` - Roll a percentile
* `/kob` - Roll an exploding die for [Kids On Bikes](/systems/kob)
* `/nwod` - Roll a pool of d10s using rules for [New World of Darkness](/systems/nwod)
* `/pba` - Roll and sum two six-sided dice
* `/formula` - Roll a combination of dice and complex modifiers
* `/roll` - Roll a set of plain dice
* `/shadowrun` - Roll a pool of d6s for [Shadowrun](/systems/shadowrun)
* `/swn` - Roll and sum two six-sided dice using rules for [Stars Without Number](/systems/swn)
* `/wod20` - Roll a pool of d10s using rules for [World of Darkness 20th Anniversary](/systems/wod20)

!> It is not possible to save secret rolls. If you want to save something, it has to be publicly visible. This is because Discord does not show a context menu for secret messages, so those messages can never be sent to *Save this roll*.

# Rolling It

Once you have a saved roll, you can start using it with `/saved roll`. It takes the name of a saved roll and runs the command and options you stored. It also takes a `bonus`, which lets you add (or subtract) a number to the command's options on the fly. See the help for `/saved roll` to learn more.

You can see the rolls you've saved by using the `/saved list` command. That will also warn you if you have a roll whose options are no longer valid. In that case, you'll have to replace the roll in order to use it.

How do you update a saved roll? By using `/saved manage` or `/saved grow`! The `/saved grow` command lets you make small changes to a roll to keep it up to date with a character sheet. The more involved `/saved manage` lets you remove a roll or edit its name and description. See the help for `/saved grow` and `/saved manage` to learn more.

?> To change all of a roll's options, it's usually easier to overwrite it with a new roll than to run `/saved grow` a bunch of times.
