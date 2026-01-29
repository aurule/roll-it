jest.mock("../../util/message-builders")

import { Interaction } from "../../../testing/interaction.js"
import { test_secret_option } from "../../../testing/shared/execute-secret.js"

const met_opposed_command = require("./opposed")

describe("/met opposed", () => {
  describe("execute", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    it("errors on self opponent", () => {
      interaction.command_options.opponent = { id: interaction.user.id }

      met_opposed_command.execute(interaction)

      expect(interaction.replyContent).toMatch("cannot challenge yourself")
    })
  })
})
