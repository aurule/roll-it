# Kids On Bikes

This is an exceptionally elegant system. Roll a single die and explode on the highest result. Add a modifier and you're done!

!> The by-book rules say that you should stop exploding once you meet the difficulty value of the test. However, Roll It doesn't have that difficulty, so it will keep exploding. Ignoring that book rule is a popular house rule anyway, but it's still worth noting.

## `/kob`

Rolls one polyhedral die: 4, 6, 8, 10, 12, 20, or 100. The highest number explodes.

* `modifier` is a number added to the die result.

Example:

```
/kob sides:6
```

gives

```
<@user> rolled **9** (d6: [**6**, 3])
```
