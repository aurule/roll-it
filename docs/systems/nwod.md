# Chronicles of Darkness

*AKA New World of Darkness*

*Chronicles of Darkness 1e (New World of Darkness) is out of print. Find Chronicles of Darkness 2e at [Onyx Path Publishing](https://theonyxpath.com/category/worlds/chroniclesofdarkness/).*

The `/nwod` roller handles the mechanics for both 1e and 2e, since they're identical. It's a pretty complex system, so here's a brief walkthrough on how Roll It handles things.

?> So why's it named `/nwod` and not `/cod`? Habit, mostly. The system wasn't rebranded until several years after my groups had started using it. So we got used to the old name and the new one never stuck.

Most rolls are straightforward. You roll a number of d10s and count one success for each die that comes up an 8, 9, or 10. Then, you re-roll any dice that show a 10 and count *their* successes. Keep going until you stop re-rolling.

The number where you re-roll changes often, so you can set it with the `explode` option. If you can't re-roll, set it to 11. The threshold for a success changes much less often, but you can change it with the `threshold` option for those circumstances.

*Very* rarely, you can have the rote benefit to a roll. Set it with the `rote` option. When active, you get to re-roll every die in your **initial** dice pool that does not roll a success.

When you have no dice (a `pool` of zero), you instead roll a single special "chance" die. Roll It handles this just fine.

?> A chance die uses a very different set of rules than normal. It only succeeds on a natural 10 (which you *can* re-roll) and it causes a Dramatic Failure on a natural 1. Where it gets really weird is how it behaves with the rote benefit. This is explained (unclearly, imo) on page 135 of the *New World of Darkness 1e* core rulebook, but I'll summarize it here. When you have a chance die on a rote roll, you can re-roll a failed result of 2-9. If that result is a 1, you get a Dramatic Failure and *cannot* re-roll. On a natural 10, you re-roll *twice:* once for the rote benefit, and once for the natural 10. Roll It takes care of this logic for you.

<!-- panels:start -->
<!-- panels:title -->
Example of a chance die:
<!-- div:left-panel -->
```invocation
/nwod pool:0 description:I can't see *shit*
```
<!-- div:right-panel -->
<@user> rolled a **dramatic failure** for "I can't see *shit*" (a chance die succeeding on 10: 1)
<!-- panels:end -->

For some extended tests, what really matters is how many rolls it takes to get to a total number of successes. The `until` option lets you set that threshold, and cap the maximum tries with the `rolls` option.

Whenever you're making more `rolls` than 1, or using the `until` option, the default assumption is that your entire dice pool should be rolled multiple times. This is perfect for repeated tasks on multiple days, or groups of NPCs all rolling the same thing at once. It's not so good when a single character is re-trying the same check over and over, like the roll to open a lock or stabilize a dying man. In these cases, the re-try rules say you should lower your pool by one for each attempt after the first. The `decreasing` option lets you do just that.

?> In most cases when using `until` alongside `decreasing`, you want to stop trying when you get to a small enough dice pool. Either 1-2 dice, or a chance die. Set `rolls` to the size of your pool or just under it, and you'll stop after that many attempts.

If you have multiple people assisting with a roll, they roll their own pools first and each success gives you a bonus die. The `teamwork` option makes it easy to gather those bonuses into a final pool, including requesting specific people to help.

## `/nwod`

Roll a number of d10s and tally the results. Has special handling for Chronicles of Darkness dice mechanics.

* `pool` is the number of dice to roll
* `explode` is the number a die needs to meet or beat in order to re-roll. Defaults to 10.
* `threshold` is the number a die needs to meet or beat to count as a success. Defaults to 8.
* `rote` turns on the rote benefit, where non-successes in the first pool are re-rolled.
* `until` is the number of successes that are desired. The roll will be repeated until that number is met, or until you've rolled `rolls` number of times.
* `decreasing` lowers the pool of each subsequent roll by one die.
* `teamwork` turns on teamwork mode, making it easy to gather helpers' results.

<!-- panels:start -->
<!-- panels:title -->
Example:
<!-- div:left-panel -->
```invocation
/nwod pool:8 explode:9
```
<!-- div:right-panel -->
<@user> rolled **3** (7 dice with 9-again: [4, **9!**, 6, 7, 1, 4, **9!**, **8**, 1])
<!-- panels:end -->
