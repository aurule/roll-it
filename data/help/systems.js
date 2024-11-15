const { inlineCode, italic, unorderedList } = require("discord.js")
const { oneLine } = require("common-tags")

const { present } = require("../../presenters/command-name-presenter")
const { siteLink } = require("../../util/formatters")

module.exports = {
  name: "systems",
  title: "Dice Systems",
  description: "The dice mechanics that Roll It supports",
  help() {
    const commands = require("../../commands")
    const cmd = commands.mapValues(present)
    return [
      oneLine`
        Although you ${italic("can")} use the ${cmd.get("roll")} and ${cmd.get("roll-formula")}
        commands to roll dice for basically any system you can think of, some systems have complex rules.
        Counting successes, exploding dice, or comparing different tallies is doable but annoying with generic
        rollers. It's much easier if all that math is handled for you, which is where Roll It's game-specific
        commands come to the rescue.
      `,
      "",
      oneLine`
        Here's the list of game systems whose dice mechanics have a command in Roll It, along with any
        caveats. As always, the help info for a specific command will have more info than what's here. To
        read in more detail, see the ${siteLink("Systems page", "/systems")} on Roll It's website.
      `,
      "",
      unorderedList([
        oneLine`
          D&D 5e: ${cmd.get("d20")} and ${cmd.get("curv")}. Supports rolling with advantage or disadvantage.
        `,
        oneLine`
          Don't Rest Your Head: ${cmd.get("drh")}. Rolls all the pools and figures out what dominates the
          roll. Full support for Minor and Major uses of an exhaustion talent, as well as validation for
          Madness talents.
        `,
        oneLine`
          FATE: ${cmd.get("fate")}. Rolls fudge dice and shows the resulting faces. Uses the by-book ladder.
        `,
        oneLine`
          Kids On Bikes: ${cmd.get("kob")}. Handles exploding the highest result on a die. However, it
          does not stop after the test is passed, since it doesn't know the difficulty.
        `,
        oneLine`
          MET Revised: ${cmd.get("met static")} and ${cmd.get("met opposed")}. It's rock-paper-scissors with
          proper support for ${inlineCode("bomb")} and interactive opposed tests.
        `,
        oneLine`
          New World of Darkness / Chronicles of Darkness: ${cmd.get("nwod")}. Works for both first and
          second edition of Chronicles of Darkness. Rolls and tallies with correct exploding dice. Handles
          chance rolls, the rote benefit, and has an interactive teamwork mode.
        `,
        oneLine`
          Shadowrun 4e, 5e, 6e: ${cmd.get("shadowrun")}. Handles glitches, the rule of six, and has an
          interactive teamwork mode.
        `,
        oneLine`
          World of Darkness 20th Anniversary Edition: ${cmd.get("wod20")}. Rolls and tallies, with support
          for specialties and an interactive teamwork mode.
        `,
        oneLine`
          Generic: ${cmd.get("d10")}, ${cmd.get("d100")}, and ${cmd.get("d20")}, along with
          ${cmd.get("roll")} and ${cmd.get("roll-formula")}. These commands don't do anything too
          crazy and will give you a plain result. For many games, that's enough!
        `,
      ]),
    ].join("\n")
  },
}
