vitest.mock("../../util/message-builders")

import { Interaction } from "../../../testing/interaction.js"

import { Opposed } from "./opposed.js"

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
