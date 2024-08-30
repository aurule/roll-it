# FATE

The FATE system uses special Fudge dice, which are six-sided and numbered -1, -1, 0, 0, +1, +1. They're always rolled in sets of four and their faces added up.

## `/fate`

Rolls a pool of 4 Fudge dice and adds up their results.

* `modifier` is the number to add to the pool's sum

Example:

```
/fate modifier:5
```

gives

```
<@user> rolled **a Fair (+2)** : <:fatezero:1038147645874647111><:fateneg:1038147643836203018><:fateneg:1038147643836203018><:fateneg:1038147643836203018> + 5
```
