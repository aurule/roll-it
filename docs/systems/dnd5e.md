# Dungeons & Dragons 5e

*Find the game at [D&D Beyond](https://www.dndbeyond.com/) and the rules at [d20srd.org](https://5e.d20srd.org/)*

Most rolls in all versions of Dungeons & Dragons can be made using the [Generic](/systems/generic) rollers. Even complex damage rolls are easy with the `/roll-formula` command. The exception are d20 rolls that have *advantage*. In order to roll two dice and pick either the higher or lower result, the `/d20` command has a special `with` option.

## `/d20`

Roll a 20-sided die. When `with` is either `Advantage` or `Disadvantage`, roll two dice and pick the higher or lower result, respectively.

* `modifier` an optional number to add to the result of the die
* `with` lets you roll twice and keep the higher or lower result. Implemented for the [D&D 5e](/systems/dnd5e) system.

<!-- panels:start -->
<!-- panels:title -->
Example:
<!-- div:left-panel -->
```invocation
/d20 modifier:6 with:Advantage
```
<!-- div:right-panel -->
<@user> rolled **26** ([20, ~~6~~] + 6) with advantage
<!-- panels:end -->

## `/curv`

Roll a pool of 3d6. When `with` is either `Advantage` or `Disadvantage`, roll two pools and pick the one with the higher or lower sum, respectively. Under this scheme, a crit is any roll that scores 16 or more on the dice, before adding your modifier. A critical failure (natural 1) is any roll that scores 5 or less on the dice.

* `modifier` an optional number to add to the result of the die
* `with` lets you roll twice and keep the higher or lower result. Implemented for the [D&D 5e](/systems/dnd5e) system.

<!-- panels:start -->
<!-- panels:title -->
Example:
<!-- div:left-panel -->
```invocation
/curv modifier:6 with:Advantage
```
<!-- div:right-panel -->
<@user> rolled **21** with advantage (~~14 [6,5,3]~~, 15 [5,5,5] + 6)
<!-- panels:end -->
