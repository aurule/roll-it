# World of Darkness Revised MET

The `/chop` roller creates a single rock-paper-scissors symbol, with options to convert it automatically to pass-tie-fail to simulate a static test.

It also supports the `bomb` advantage, replacing the paper symbol with bomb. This wins against rock and paper, so static results become pass-pass-fail.

## `/chop`

* `static` shows pass-tie-fail instead of rock-paper-scissors
* `bomb` replaces the paper result with bomb instead

Example:

```
/chop
```

gives

```
<@user> rolled :rock: rock
```
