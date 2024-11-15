const { inlineCode, italic, heading, orderedList } = require("discord.js")
const { oneLine } = require("common-tags")

const CommandNamePresenter = require("../../presenters/command-name-presenter")
const { siteLink } = require("../../util/formatters")

module.exports = {
  name: "saved",
  title: "Saved Rolls",
  description: "How to save rolls and use them later",
  help() {
    const savable_commands = require("../../commands").savable
    const saved_set = inlineCode("/saved set")
    const save_roll = italic("Save this roll")
    const roll = inlineCode("/saved roll")
    const list = inlineCode("/saved list")
    const manage = inlineCode("/saved manage")
    const grow = inlineCode("/saved grow")

    return [
      italic(oneLine`
        You can also read about ${siteLink("Saved Rolls", "/saved")} on the Roll It Website.
      `),
      "",
      oneLine`
        When you need to use a complicated roll over and over again, Roll It can save that roll so you don't
        have to type out (and remember) the whole thing each time. In order to save a roll, you need three
        parts:
      `,
      "",
      orderedList([
        oneLine`
          A name for the saved roll. This is how you will find it if you save more than one, so the name has
          to be unique.
        `,
        oneLine`
          A description for the saved roll. This should describe what the roll does, and will be shown as the
          default description each time you use that saved roll.
        `,
        oneLine`
          The command and its options. This does the actual rolling, so it's super important.
        `,
      ]),
      "",
      oneLine`
        In order to save all this, Roll It uses a pair of commands. The first is a normal slash command,
        ${saved_set}, which stores the name and description. The second is a context command (more on those in
        a moment) named ${save_roll}, which stores the command and its options. That's it! Once you've saved
        all three parts, you're ready to use your saved roll.
      `,
      "",
      oneLine`
        You can save the parts of a new roll in any order. You can start with ${save_roll} if you realize you
        want to save the roll you just made, or with ${saved_set} if you have a name in mind first. Roll It
        will save one incomplete command at a time for you to finish up later.
      `,
      heading("Starting With a Command", 2),
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
        ${save_roll} lets you save a command that you've just used. To do so, use ${save_roll} on the message
        with that command's results. It will read that result message and save the command and options that
        were used to create it. Then, it will prompt you to take the next step and use ${saved_set} to finish
        up your saved roll with a name and a description.
      `,
      "",
      oneLine`
        > For an example, let's say you used ${inlineCode("/roll pool:2 sides:6")} and Roll It replied with
        ${inlineCode("@you rolled 9 (2d6: [5,4])")}. By long pressing or right clicking on
        ${inlineCode("@you rolled 9 (2d6: [5,4])")}, you select ${inlineCode("Apps")} and then ${save_roll}.
        Roll It reads the message and determines that you used the ${inlineCode("/roll")} command with a
        ${inlineCode("pool")} of 2 and ${inlineCode("sides")} of 6. It saves that, and tells you to run
        ${saved_set} to save the name and description. Once you do, you can use your roll!
      `,
      "",
      oneLine`
        Not all commands can be saved. Some do not roll actual dice (like ${inlineCode("/table roll")} or
        ${inlineCode("/help")}), or don't have re-usable options (like ${inlineCode("/coin")}), or are so
        simple that it's more effort to use a saved roll than to just use the options. Here are the commands
        that can be saved:
      `,
      CommandNamePresenter.list(savable_commands),
      heading("Starting With a Name", 2),
      oneLine`
        As noted, you can also begin making a new saved roll with ${saved_set} and supplying a
        ${inlineCode("name")} and ${inlineCode("description")}. ${saved_set} will reply with instructions to
        use ${save_roll} to save the command and options. Once you do, your roll is ready to go!
      `,
      "",
      oneLine`
        The name of the roll has a single special limitation: you, personally, cannot have two rolls in the
        same server with the same name.
      `,
      heading("Rolling It"),
      oneLine`
        Once you have a saved roll, you can start using it with ${roll}. It takes the name of a saved roll and
        runs the command and options you stored. It also takes a ${inlineCode("bonus")}, which lets you add to
        the command's options on the fly. See the help for ${roll} to learn more.
      `,
      "",
      oneLine`
        You can see the rolls you've saved by using the ${list} command. That will also warn you if you have
        an unfinished roll, or one whose options are no longer valid. In either case, you'll have to update
        the roll in order to use it.
      `,
      "",
      oneLine`
        So how do you update a saved roll? By using ${manage} or ${grow}! The ${grow} command lets you make
        small changes to a roll to keep it in sync with a character sheet. The more involved ${manage} lets
        you remove or edit a roll as needed. See the help for${grow} and ${manage} to learn more.
      `,
      heading("Advanced Usage: The Invocation", 2),
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
        The format for an invocation looks like ${inlineCode("/command option:value")}. So for example,
        ${inlineCode("/roll pool:2 sides:6")} or ${inlineCode("/wod20 pool:7 difficulty:6 specialty:true")}
        are both valid invocations. When you supply an invocation along with a name and description, the
        saved roll is complete and you can use it right away.
      `,
    ].join("\n")
  },
}
