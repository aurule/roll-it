# World of Darkness Revised MET

*This game is out of print. Find related material at [By Night Studios](https://bynightstudios.com/)*

The Mind's Eye Theatre system makes use of two commands, `/met static` and `/met opposed`.

The `/met static` command lets a user throw a rock-paper-scissors chop against a randomly-rolling opponent, suitable for static and simple tests. It can roll many such tests at once, which is handy for streamlining ST rolls or group actions.

The `/met opposed` command is much more involved and starts an interactive opposed challenge against a named user. Each participant has a chance to choose what they throw and retest multiple times -- with cancels -- in order to resolve the challenge.

?> The old `/chop` command is just a shortcut for `/met static`.

## `/met static`

Compare the user's throw against a randomly generated rock-paper-scissors throw.

* `throw` is the symbol you want to use. Can be random or chosen specifically from one of rock, paper, bomb, or scissors. Default is random rock-paper-scissors.
* `vs` is the set of symbols your virtual opponent should pick from. The default is random rock, paper, or scissors, but you can set this to random rock, bomb, or scissors to represent a more dangerous opponent. You can also set `vs` to `None`, in which case only your own symbol is shown.

<!-- panels:start -->
<!-- panels:title -->
Example:
<!-- div:left-panel -->
```invocation
/met static
```
<!-- div:right-panel -->
<@user> rolled **win** (:rock: rock _vs_ :scissors: scissors)
<!-- panels:end -->

## `/chop`

The `/chop` command is a shortcut to `/met static` with simplified options. It defaults to displaying a single random symbol.

* `static` is whether to show your result against a virtual opponent
* `bomb` is whether to pick randomly from rock/bomb/scissors instead rock/paper/scissors

<!-- panels:start -->
<!-- panels:title -->
Example:
<!-- div:left-panel -->
```invocation
/chop
```
<!-- div:right-panel -->
<@user> rolled :rock: rock
<!-- panels:end -->

## `/met opposed`

Start an interactive challenge against another user.

* `opponent` is the user you wish to challenge
* `attribute` is the attribute used to determine total traits. One of Mental, Social, or Physical.
* `retest` is the named ability for retesting tests in the challenge

Example:

```invocation
/met opposed opponent:@RicePilaf attribute:Physical retest:Brawl description:Gonna punch you
```

The `/met opposed` command makes it easy to manage the flow of opposed challenges in MET. It tracks the challenge conditions like carrier and altering; character advantages like bomb, ties, and cancels; the symbols thrown for each chop; retests and cancels used; traits bid by each party during a tie; and it summarizes everything at each step of the way.

To do this, `/met opposed` uses a whole bunch of interactive messages. Sometimes, Discord makes a mistake and a message isn't shown. If things look wrong or are behaving weirdly, you can reply to any message for a challenge with the word `retry`, and Roll It will send the most up-to-date message again.

?> Opposed challenges can be very slow on Discord. To keep things moving, try to be extra attentive to the channel where the challenge is happening, and consider hopping into a voice channel with the other participant.

?> Retests can be made for any number of reasons. Due to the limitations of Discord, it is not possible to write in the details of what you're using, only what kind of retest it is: ability, item, merit, power, etc. If there is any question, confer with your ST and the other participant directly.
