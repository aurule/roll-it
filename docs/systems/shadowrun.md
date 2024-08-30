# Shadowrun

The `/shadowrun` command implements the dice system used in Shadowrun 4e, 5e, and 6e. It rolls a pool of d6s and tallies one success for each die that shows a 5 or 6. The `edge` option turns on the Rule of Six, which re-rolls every 6.

Then, you tally up the total dice that rolled a 1. If they make up half your pool, you have a Glitch. If you have successes as well, that's where it stays. But if you have *no* successes, it becomes a Critical Glitch.

If you have multiple people assisting with a roll, they roll their own pools first and each success gives you a bonus die in 4e and 6e. The `teamwork` option makes it easy to gather those bonuses into a final pool, including requesting specific people to help.

!> If you're using 5e, the teamwork option isn't useful to you, since teamwork in that system raises the max successes instead of adding dice.

For some extended tests, what really matters is how many rolls it takes to get to a total number of successes. The `until` option lets you set that threshold, and cap the maximum tries with the `rolls` option.

## `/shadowrun`

Roll a pool of d6s, counting one success for each die that rolls a 5 or 6. Can re-roll every 6 with the `edge` option.

* `pool` is the number of dice to roll
* `edge` is whether edge was spent on the roll. Turns on the Rule of Six benefit.
* `teamwork` turns on teamwork mode, making it easy to gather helpers' results.
* `until` is the number of successes that are desired. The roll will be repeated until that number is met, or until you've rolled `rolls` number of times.
