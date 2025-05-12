# Generic Dice

Many systems work just fine using the standard polyhedral dice: d6, d8, d10, d12, d20, and d100.

Roll It supports these in a few ways, depending on what you want to do:

* `/roll` rolls one or more dice with the same number of sides
* `/formula` rolls as many sets of dice as you want, along with powerful modifiers
* `/d4` rolls one or more four-sided dice
* `/d6` rolls one or more six-sided dice
* `/d8` rolls one or more eight-sided dice
* `/d10` rolls one or more ten-sided dice
* `/d12` rolls one or more twelve-sided dice
* `/d20` rolls one twenty-sided die
* `/d100` rolls one or more percentile dice

## `/roll`

The `/roll` command lets you roll one or more dice of the same type. The dice will be added together, then the optional `modifier` will be added on.

* `pool` is the number of dice to roll
* `sides` is the number of sides on the dice. For this command, all dice have to have the same number of sides.
* `modifier` is an optional number to add to the final result

<!-- panels:start -->
<!-- div:left-panel -->
```invocation
/roll pool:3 sides:6 modifier:2
```
<!-- div:right-panel -->
@user rolled **13** (3d6: [3,5,3] + 2)
<!-- panels:end -->

## `/formula`

The `/formula` command lets you supply a complex series of dice pools, modifiers, and mathematical expressions to evaluate. To specify dice, use the format `1d6` where `1` is the number of dice and `6` is the sides. You can also label a pool by putting a word or two in quotes right after the pool, like `2d8"magic"`. Roll It will parse and roll these dice *before* every other operation.

The math is handled by the excellent [math.js](https://mathjs.org) library. Read up on its [syntax guide](https://mathjs.org/docs/expressions/syntax.html) and [supported functions](https://mathjs.org/docs/reference/functions.html) if there's something really wild you want to try.

* `formula` is the formula to evaluate

<!-- panels:start -->
<!-- div:left-panel -->
```invocation
/formula formula:2d6 + 1d8"fire" + 19
```
<!-- div:right-panel -->
<@user> rolled **30** on `2d6 + 1d8"fire" + 19`:
<ul class="indented-lines">
<li>8 from 2d6 [6,2]</li>
<li>3 fire from 1d8 [3]</li>
</ul>
30 = 8 + 3 + 19
<!-- panels:end -->

## `/d6`

This just rolls some 6-sided dice.

* `modifier` an optional number to add to the result of the die

## `/d10`

This rolls a single 10-sided die.

* `modifier` an optional number to add to the result of the die

## `/d20`

This one rolls a single 20-sided die.

* `modifier` an optional number to add to the result of the die
* `with` lets you roll twice and keep the higher or lower result. Implemented for the [D&D 5e](/systems/dnd5e) system.

## `/d100`

This rolls a single 100-sided die.

?> Percentiles are often called for when rolling on a table. Have a look at the [Rollable Tables](/features/tables) feature if that's something you need to do often.

* `modifier` an optional number to add to the result of the die
