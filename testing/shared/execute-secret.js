const { MessageFlags } = require("discord.js")

const { Interaction } = require("../interaction")
const { pretty } = require("../command-pretty")

/**
 * Test the shared behavior of the `secret` option
 *
 * The `secret`` option has standardized behavior across all commands, as it is a shared option. When true,
 * the main reply message of the command is set to ephemeral. When false, it is not.
 *
 * Since error responses disregard the `secret` option, this function needs to be given interaction options
 * which will result in the command sending the standard success reply.
 *
 * For particularly intricate tests, like those which rely on database state, pass a function to
 * `after_interaction`. This callback is run at the end of the beforeEach() chain.
 *
 * @example
 * ```js
 * test_secret_option(roll_command, {pool: 1, sides: 2}, (interaction) => interaction.customId = "testid")
 * ```
 *
 * @param  {Object}   command             Command to test
 * @param  {Object}   interaction_options Option values to add to the interaction before each test
 * @param  {callable} after_interaction   Optional callable to run more setup after the interaction is created
 * @return {describe}                     Jest describe results
 */
function test_secret_option(command, interaction_options, after_interaction) {
  var interaction

  return describe(`${pretty(command)} execute`, () => {
    beforeEach(() => {
      interaction = new Interaction()
      interaction.command_options = { ...interaction_options }
      typeof after_interaction === "function" && after_interaction(interaction)
    })

    it("when secret is true, reply is ephemeral", async () => {
      interaction.command_options.secret = true

      await command.execute(interaction)

      expect(interaction.replies[0].flags).toHaveFlag(MessageFlags.Ephemeral)
    })

    it("when secret is false, reply is not ephemeral", async () => {
      interaction.command_options.secret = false

      await command.execute(interaction)

      expect(interaction.replies[0].flags).not.toHaveFlag(MessageFlags.Ephemeral)
    })

    it("secret defaults to false", async () => {
      await command.execute(interaction)

      expect(interaction.replies[0].flags).not.toHaveFlag(MessageFlags.Ephemeral)
    })
  })
}

module.exports = {
  test_secret_option,
}
