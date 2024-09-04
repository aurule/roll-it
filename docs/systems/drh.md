# Don't Rest Your Head

Don't Rest Your Head is a rules-light game system with a surprisingly rules-heavy dice mechanic. It breaks down like this:

1. Roll 2-4 pools of d6s, each of which is named Discipline, Exhaustion, Madness, or Pain. Discipline and Pain are always present.
2. Each die that rolls a 1-3 is a success. Tally these separately for each pool.
3. Then compare the dice of each pool to find the highest number rolled, like 6. That pool "dominates" the roll.
    1. If two pools have the highest number, compare how many dice in each pool show that number.
    2. If that fails to break the tie, move on to the next highest number between those pools and compare again.
    3. If the tied pools are actually identical, resolve using a static test: Discipline > Madness > Exhaustion > Pain.
4. Add up the successes from Discipline, Exhaustion, and Madness.
5. Apply the Talent, if present
    * Minor Exhaustion sets the minimum number of successes to the exhaustion pool
    * Major Exhaustion adds the exhaustion pool as automatic successes
    * Madness does magic. No mechanical effect.
6. Compare total (possibly modified) D/E/M successes against the successes in the Pain pool. Pain loses ties.

So that's a lot. The `/drh` command does all of this automatically.

## `/drh`

Roll pools of d6s, tally, and compare results. Also applies special rules logic for talents.

* `discipline` is the number of dice in the Discipline pool
* `pain` is the number of dice in the Pain pool
* `exhaustion` is the number of dice in the optional Exhaustion pool
* `madness` is the number of dice in the optional Madness pool
* `talent` is the type of talent in use, if any

Example:

```
/drh discipline:3 pain:4 exhaustion:1 madness:1 talent:Minor Exhaustion
```

gives

```
<@user> rolled a **failure** dominated by **discipline** using a Minor Exhaustion talent
    0 discipline (4, __6__, 4)
    0 madness (4)
    0 exhaustion (5)
    _~~0~~ 1_ vs 3 pain (**2**, **1**, 5, **2**)
```