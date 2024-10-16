# FATE

The FATE system uses special Fudge dice, which are six-sided and numbered -1, -1, 0, 0, +1, +1. They're always rolled in sets of four and their faces added up.

## `/fate`

Roll a pool of 4 Fudge dice and add up their results.

* `modifier` is the number to add to the pool's sum

<!-- panels:start -->
<!-- panels:title -->
Example:
<!-- div:left-panel -->
```invocation
/fate modifier:5
```
<!-- div:right-panel -->
<@user> rolled **a Fair (+2)** : ![zero](../_images/fate-zero.png ':class=emoji')![negative](../_images/fate-neg.png ':class=emoji')![negative](../_images/fate-neg.png ':class=emoji')![negative](../_images/fate-neg.png ':class=emoji') + 5
<!-- panels:end -->
