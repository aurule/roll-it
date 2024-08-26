const { inlineCode, italic, unorderedList } = require("discord.js")
const { oneLine } = require("common-tags")

module.exports = {
  name: "systems",
  title: "Dice Systems",
  description: "The dice mechanics that Roll It supports",
  help() {
    return [
      oneLine`
        Although you ${italic("can")} use the ${inlineCode("/roll")} and ${inlineCode("/roll-formula")}
        commands to roll dice for basically any system you can think of, some systems have complex rules.
        Counting successes, exploding dice, or comparing different tallies is doable but annoying with generic
        rollers. It's much easier if all that math is handled for you, which is where Roll It's game-specific
        commands come to the rescue.
      `,
      "",
      oneLine`
        Here's the list of game systems whose dice mechanics have a command in Roll It, along with any
        caveats. As always, the help info for a specific command will have more detail than what's here.
      `,
      "",
      unorderedList([
        oneLine`
          D&D 5e: ${inlineCode("/d20")}. Supports rolling with advantage or disadvantage.
        `,
        oneLine`
          Don't Rest Your Head: ${inlineCode("/drh")}. Rolls all the pools and figures out what dominates the
          roll. Full support for Minor and Major uses of an exhaustion talent, as well as validation for
          Madness talents.
        `,
        oneLine`
          FATE: ${inlineCode("/fate")}. Rolls fudge dice and shows the resulting faces. Uses the by-book ladder.
        `,
        oneLine`
          Kids On Bikes: ${inlineCode("/kob")}. Handles exploding the highest result on a die. However, it
          does not stop after the test is passed, since it doesn't know the difficulty.
        `,
        oneLine`
          MET Revised: ${inlineCode("/chop")}. It's rock-paper-scissors with proper support for
          ${inlineCode("bomb")} and static tests.
        `,
        oneLine`
          New World of Darkness / Chronicles of Darkness: ${inlineCode("/nwod")}. Works for both first and
          second edition of Chronicles of Darkness. Rolls and tallies with correct exploding dice. Handles
          chance rolls, the rote benefit, and has an interactive teamwork mode.
        `,
        oneLine`
          Shadowrun 4e, 5e, 6e: ${inlineCode("/shadowrun")}. Handles glitches, the rule of six, and has an
          interactive teamwork mode.
        `,
        oneLine`
          World of Darkness 20th Anniversary Edition: ${inlineCode("/wod20")}. Rolls and tallies, with support
          for specialties and an interactive teamwork mode.
        `,
        oneLine`
          Generic: ${inlineCode("/d10")}, ${inlineCode("/d100")}, and ${inlineCode("/d20")}, along with
          ${inlineCode("/roll")} and ${inlineCode("/roll-formula")}. These commands don't do anything too
          crazy and will give you a plain result. For many games, that's enough!
        `,
        oneLine`
          Misc: ${inlineCode("/coin")} and ${inlineCode("/eightball")}. These don't really roll dice, but
          they're fun.
        `,
      ])
    ].join("\n")
  },
}
