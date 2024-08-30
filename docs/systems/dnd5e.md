# Dungeons & Dragons 5e

Most rolls in all versions of Dungeons & Dragons can be made using the [Generic](/systems/generic) rollers. Even complex damage rolls are easy with the `/roll-formula` command. The exception are d20 rolls that have *advantage*. In order to roll two dice and pick either the higher or lower result, the `/d20` command has a special `with` option.

## `/d20`

Roll a 20-sided die. When `with` is either `Advantage` or `Disadvantage`, roll two dice and pick the higher or lower result, respectively.

* `modifier` an optional number to add to the result of the die
* `with` lets you roll twice and keep the higher or lower result. Implemented for the [D&D 5e](/systems/dnd5e) system.

Example:

```
/d20 modifier:6 with:Advantage
```

gives

```
<@user> rolled **26** ([20, ~~6~~] + 6) with advantage
```
