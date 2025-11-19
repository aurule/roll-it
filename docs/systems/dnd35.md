# Dungeons & Dragons 3.5

*This game is out of print. Find the rules at [d20srd.org](https://www.d20srd.org/index.htm)*

Most rolls in Dungeons & Dragons 3.5 can be made using the [Generic](/systems/generic) rollers, but some specific actions have finnicky rules. The `/dnd` family of commands streamlines these rules to make rolling character actions easier and faster, especially for NPCs.

The `/formula` command is also extremely helpful for spell and weapon damage rolls.

## `/dnd attack`

Make an [Attack roll](https://www.d20srd.org/srd/combat/combatStatistics.htm#attackRoll), optionally against the target's AC. For attacks, a natural 1 is always a miss, and a natural 20 is always a hit -- and a crit threat. The `/dnd attack` command will automatically roll to confirm a possible crit when the die is a natural 20, or is high enough to meet or exceed the `crit` argument.

* `modifier` is the total attack bonus to add to the rolled die
* `crit` is the minimum threshold for a roll to threaten a critical hit. Defaults to 20.
* `ac` is the armor class of the target. Optional.

?> If you can't crit at all (like when fighting undead), set `crit` to zero.

<!-- panels:start -->
<!-- panels:title -->
Example:
<!-- div:left-panel -->
```invocation
/dnd attack modifier:6 crit:19 ac:17
```
<!-- div:right-panel -->
<@user> rolled an attack *vs* AC 17 (hit +6, crit 19-20)
1. **miss** with 10 (1d20: [4] + 6)
<!-- panels:end -->

## `/dnd full-attack`

Make a [Full Attack action](https://www.d20srd.org/srd/combat/actionsInCombat.htm#fullAttack), with multiple attack rolls in sequence. Each attack in the sequence has its `modifier` lowered by 5, to reflect the rule of decreasing bonuses for subsequent attacks. The rules are identical `/dnd attack`, including automatic rolling to confirm possible crits.

!> The rules used by `/dnd full-attack` are only suitable for full attacks based on a character's BAB. Many monsters use different rules to make multiple attacks using the same attack bonus, or decrease their subsequent attacks by a different amount. These sorts of sequences can also happen due to various feats or class features, like [Whirlwind Attack](https://www.d20srd.org/srd/feats.htm#whirlwindAttack) or a Monk's [Flurry of Blows](https://www.d20srd.org/srd/classes/monk.htm#flurryofBlows). For all of these situations, you'll have to use multiple `/dnd attack` commands instead.

* `swings` is the total number of swings in each full attack sequence
* `modifier` is the highest attack bonus of the sequence
* `crit` is the minimum threshold for a roll to threaten a critical hit. Defaults to 20.
* `ac` is the armor class of the target. Optional.

!> The `modifier` *must* include your character's BAB.

?> If you can't crit at all (like when fighting undead), set `crit` to zero.

?> The `rolls` option for `/dnd full-attack` determines the number of Full Attack actions made, each of which has multiple swings.

<!-- panels:start -->
<!-- panels:title -->
Example:
<!-- div:left-panel -->
```invocation
/dnd full-attack swings:2 modifier:12 ac:21
```
<!-- div:right-panel -->
<@user> rolled a full attack *vs* AC 21 (hit +12, crit 20)
1. Full attack with 2 swings
    1. **miss** with 16 (1d20: [4] + 12)
    2. **hit** with 25 (1d20: [18] + 7)
<!-- panels:end -->

## `/dnd save`

Roll a [Saving Throw](https://www.d20srd.org/srd/combat/combatStatistics.htm#savingThrows). A natural 1 is always a failure, and a natural 20 is always a success.

* `modifier` is the total save bonus to add to the rolled die. Optional.
* `dc` is the difficulty class of the save. Optional.

<!-- panels:start -->
<!-- panels:title -->
Example:
<!-- div:left-panel -->
```invocation
/dnd save modifier:6 dc:19
```
<!-- div:right-panel -->
<@user> **saved** with a natural 20 (1d20: [20] + 6) *vs* DC 19
<!-- panels:end -->

## `/dnd skill`

Roll a [Skill Check](https://www.d20srd.org/srd/skills/usingSkills.htm#skillChecks). Unlike saves and attacks, a natural 1 or natural 20 have no special meaning for skill checks.

* `modifier` is the total skill modifier to add to the rolled die. Optional.
* `dc` is the difficulty class of the check. Optional.

<!-- panels:start -->
<!-- panels:title -->
Example:
<!-- div:left-panel -->
```invocation
/dnd skill modifier:11 dc:25
```
<!-- div:right-panel -->
<@user> **failed** with a 14 (1d20: [3] + 11) *vs* DC 25
<!-- panels:end -->
