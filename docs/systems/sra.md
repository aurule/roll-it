# Shadowrun Anarchy 2.0

*Shadowrun Anarchy 2.0 is currently in limited release to backers of its Kickstarter project.*

The `/sra` command implements the dice system used in Shadowrun Anarchy 2.0. It rolls a pool of d6s and tallies one success for each die that shows a 5 or a 6. The `with` option lets you add Advantage: succeed on a 4 and up; or Disadvantage: succeed only on a 6.

You can also `risk` a number of the dice in your pool. Risked dice add _two_ successes for each die that rolls above the threshold, but each 1 rolled adds a Glitch.

For some extended tests, what really matters is how many rolls it takes to get to a total number of successes. The `until` option lets you set that threshold, and you can cap the maximum tries with the `rolls` option.

## `/sra`

Roll a pool of d6s, counting one success for each die that rolls a 5 or 6. Change the threshold using `with`, and take a chance for more successes with `risk`.

* `pool` is the number of dice to roll
* `risk` is the part of your pool to risk for more successes at the chance of a glitch
* `with` lets you add Advantage (succeed on 4+) or Disadvantage (succeed on 6)
* `until` is the number of successes that are desired. The roll will be repeated until that number is met, or until you've rolled `rolls` number of times.

<!-- panels:start -->
<!-- div:left-panel -->
```invocation
/sra pool:8
```
<!-- div:right-panel -->
<@user> rolled **1 success** (8 dice: [2, 1, 1, 4, 3, 1, **6**, 3])
<!-- panels:end -->

<!-- panels:start -->
<!-- div:left-panel -->
```invocation
/sra pool:8 risk:5
```
<!-- div:right-panel -->
<@user> rolled **5 successes** and a **major glitch** (8 dice risking 5: [<u>**6!**, ~~1~~, 3, **6!**, ~~1~~</u>, 4, 4, **5**])
<!-- panels:end -->
