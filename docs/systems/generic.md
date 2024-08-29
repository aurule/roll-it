# Generic Dice

Many systems work just fine using the standard polyhedral dice: d6, d8, d10, d12, d20, and d100.

Roll It supports these in a few ways, depending on what you want to do:

* `/roll` rolls one or more dice with the same number of sides
* `/roll-formula` rolls as many sets of dice as you want, along with powerful modifiers
* `/d10` rolls some d10s
* `/d20` rolls some d20s
* `/d100` rolls some percentiles

## `/roll`

The `/roll` command lets you roll one or more dice of the same type. The dice will be added together, then the optional `modifier` will be added on.

* `pool`
* `sides`
* `modifier`

Example:

```
/roll pool:3 sides:6
```

gives

```
@user rolled 11 (3d6: [3,5,3])
```

## `/roll-formula`

* `formula`

## `/d10`

* `modifier`

## `/d20`

* `modifier`
* `with`

## `/d100`

* `modifier`
