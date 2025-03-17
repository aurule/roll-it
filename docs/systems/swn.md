# Stars Without Number

Also *Worlds Without Number* and *Cities Without Number*.

*Find the games at [Sine Nomine Publishing](https://sine-nomine-publishing.myshopify.com/)*

Stars Without Number uses a combination of `/d20` for combat rolls and `/swn` for skills.

## `/swn`

Roll two or more six-sided dice and add their results.

* `modifier` is the number to add to the dice's sum
* `pool` is the number of dice to roll. Only the highest two will be kept.

<!-- panels:start -->
<!-- panels:title -->
Example:
<!-- div:left-panel -->
```invocation
/swn modifier:2
```
<!-- div:right-panel -->
<@user> rolled rolled **8** ([5, 1] + 2)
<!-- panels:end -->

When the pool is more than two, only the greatest two results will be kept.

<!-- panels:start -->
<!-- panels:title -->
Example of a larger pool:
<!-- div:left-panel -->
```invocation
/swn modifier:1 pool:3
```
<!-- div:right-panel -->
<@user> rolled rolled **10** ([5, ~~1~~, 3] + 2)
<!-- panels:end -->
