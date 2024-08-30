# World of Darkness, 20th Anniversary Edition

The `/wod20` command implements the rules for the 20th Anniversary Edition of classic World of Darkness. The core roll is a number of d10s where each die scores a success if it meets or exceeds the difficulty of the role, which is 6 by default. When using a specialty, each 10 counts twice. Each 1 rolled *removes* a success. Unlike other World of Darkness systems, there are no re-rolls in this version.

If you have at least one success, but it gets cancelled out by a bunch of ones, you simply fail the roll. If you have zero successes and any ones, then it's a botch.

If you have multiple people assisting with a roll, they roll their own pools first and each success gives you a bonus die. The `teamwork` option makes it easy to gather those bonuses into a final pool, including requesting specific people to help.

For some extended tests, what really matters is how many rolls it takes to get to a total number of successes. The `until` option lets you set that threshold, and cap the maximum tries with the `rolls` option.

## `/wod20`

* `pool` is the number of dice to roll
* `difficulty` is the threshold a die needs to reach to be a success. Default 6.
* `specialty` whether to count each ten as two successes
* `teamwork` turns on teamwork mode, making it easy to gather helpers' results.
* `until` is the number of successes that are desired. The roll will be repeated until that number is met, or until you've rolled `rolls` number of times.

Example:

```
/wod20 pool:8
```

gives

```
<@user> rolled **5** (8 diff 6: [3, **8**, **8**, **8**, 2, **9**, **6**, 2])
```
