# Final Fantasy RPG 3rd edition

*Find the game at [ffrpg.net](https://ffrpg.net/ffrpg/)*

FFRPG uses a percentile system with special rules for the chance of success (or *CoS*). The `/ffrpg` command supports all of its components, including Rule of 10, crit ranges, and botches.

The `/ffrpg` command handles a few corner cases that are not well described in the system rules:

1. When CoS is negative, the roll margin is calculated from 10 instead of from the CoS
2. When CoS is above zero, but below 10, the Rule of 10 allows a success when the roll is above the CoS and also below 10.

#> For example, rolling 7 against a CoS of 2 will show a simple success and note that it benefitted from the Rule of 10.

?> The FFRPG system also benefits from the `/d10` command for rolling initiative and `/formula` for handling weapon damage.

## `/ffrpg`

Roll a percentile and compare against a computed chance of success.

* `base` starting CoS for the roll
* `intrinsic` ability CoS modifier, or similar
* `conditional` situational CoS modifier from the GM
* `avoid` avoidance skill for the CoS
* `crit` range for a critical hit. Defaults to <= 10.
* `botch` range for a botch. Defaults to >= 95.
* `flat` whether this is a roll with no modifiers

<!-- panels:start -->
<!-- panels:title -->
Example:
<!-- div:left-panel -->
```invocation
/ffrpg base:50 intrinsic:20 conditional:-20 avoid:5
```
<!-- div:right-panel -->
<@user> rolled a **simple success** with a margin of **29** (*16* vs *45* [50 Base + 20 Intrinsic - 20 Conditional + 5 Avoid])
<!-- panels:end -->
