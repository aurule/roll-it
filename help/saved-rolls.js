const { inlineCode, italic, bold } = require("discord.js")
const { oneLine } = require("common-tags")
const CommandNamePresenter = require("../presenters/command-name-presenter")

module.exports = {
  name: "saved",
  title: "Saved Rolls",
  description: "How to save rolls and use them later",
  help() {
    const savable_commands = require("../commands").savable()
    const saved_set = inlineCode("/saved set")
    const save_roll = italic("Save this roll")

    return [
      oneLine`
        When you need to use a complicated roll over and over again, Roll It can save that roll so you don't
        have to type out (and remember) the whole thing each time. In order to save a roll, you need three
        parts:
      `,
      "",
      oneLine`
        1. A name for the saved roll. This is how you will find the roll if you save more than one, so it has
        to be unique.
      `,
      oneLine`
        2. A description for the saved roll. This should describe what the roll does, and will be shown as the
      default description each time you use that saved roll.
      `,
      oneLine`
        3. The command and its options. This does the actual rolling, so it's super important.
      `,
      "",
      oneLine`
        In order to save all this, Roll It uses a pair of commands. The first is a normal slash command,
        ${saved_set}, which stores the name and description. The second is a context command (more on those in
        a moment), ${save_roll}, which stores the command and its options. That's it! Once you've saved all
        three parts, you're ready to use your saved roll.
      `,
      "",
      oneLine`
        ${save_roll} is the first context command in Roll It, so it might need some explaining. A context
        command is a bot action that is not typed out, but is used through a menu within Discord. To get to
        that menu, you need to take different steps depending on whether you're using Discord on your phone or
        on a computer. With a phone, you long-press on a message to show the menu. On a computer, you
        right-click the message. Once that context menu shows up, you select the ${inlineCode("Apps")} item
        and a smaller menu opens up. That's where you can find ${save_roll}.
      `,
      "",
      oneLine`
        In order to save a command, you can use ${save_roll} on the message with that roll's results. It will
        read that result message and save the command and options that were used to create it. For an example,
        let's say you used ${inlineCode("/roll pool:2 sides:6")} and Roll It replied with
        ${inlineCode("@you rolled 9 (2d6: [5,4])")}. By long pressing or right clicking on
        ${inlineCode("@you rolled 9 (2d6: [5,4])")}, you select ${inlineCode("Apps")} and then ${save_roll}.
        Roll It reads the message and determines that you used the ${inlineCode("/roll")} command with a
        ${inlineCode("pool")} of 2 and ${inlineCode("sides")} of 6. It saves that. Once you have the name and
        description set as well, you can use your roll!
      `,
      "",
      oneLine`
        The name of the roll has a single special limitation: you, personally, cannot have two rolls in the
        same server with the same name.
      `,
      "",
      oneLine`
        You can save the parts of a saved roll in any order. You can start with ${save_roll} if that's more
        convenient, or with ${saved_set} if you have a name in mind first. Roll It will save one incomplete
        command at a time for you to finish up later.
      `,
      "",
      oneLine`
        So far we've assumed that you're using both ${saved_set} and ${save_roll} in order to build your saved
        commands. But what if you're a power user in a rush? Well, ${saved_set} has you covered. It has an
        advanced third option called ${inlineCode("invocation")} which lets you save a command and its options
        alongside the name and description for the saved roll. The only catch is that you have to type the
        whole command manually in a specific format, remembering the option names and everything. That's why I
        suggest using the ${save_roll} command instead of entering an ${inlineCode("invocation")}.
      `,
      "",
      oneLine`
        The format for an invocation looks like ${inlineCode("/command option:value")}. So for exmaple,
        ${inlineCode("/roll pool:2 sides:6")} or ${inlineCode("/wod20 pool:7 difficulty:6 specialty:true")}
        are both valid invocations. When you supply an invocation along with a name and description, the
        saved roll is complete and you can use it right away.
      `,
      "",
      oneLine`
        Finally, not all commands can be saved. Some do not roll actual dice (like
        ${inlineCode("/table roll")} or ${inlineCode("/help")}), or don't have re-usable options (like
        ${inlineCode("/coin")}), or are so simple that it's more effort to use a saved roll than to just use
        the options (like ${inlineCode("/chop bomb:true")} vs ${inlineCode("/saved roll name:gimme ties")}).
      `,
      "",
      "Here are the commands that can be saved:",
      CommandNamePresenter.list(savable_commands),
    ].join("\n")
  },
}
