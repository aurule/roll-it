import { Interaction } from "../../../testing/interaction.js"

import { MetStatic } from "./static.js"

describe("/met static", () => {
  let interaction

  beforeEach(() => {
    interaction = new Interaction()
  })

  describe("perform", () => {
    it("shows the sacrifice easter egg if triggered", () => {
      interaction.command_options = {
        description: "sacrifice",
      }
      const cmd = new MetStatic(interaction)

      const result = cmd.perform()

      expect(result).toMatch("Your sacrifice")
    })
  })

  describe("judge", () => {
    it("returns neutral with no vs chops", () => {
      interaction.command_options = {
        description: "sacrifice",
        vs: "none",
      }
      const cmd = new MetStatic(interaction)

      const result = cmd.judge([""])

      expect(result).toMatch("noted")
    })

    it("returns great with more than half wins", () => {
      interaction.command_options = {
        description: "sacrifice",
        vs: "rand",
        rolls: 3,
      }
      const cmd = new MetStatic(interaction)

      const result = cmd.judge(["win", "win", "tie"])

      expect(result).toMatch("pleases")
    })

    it("returns good with more than half ties", () => {
      interaction.command_options = {
        description: "sacrifice",
        vs: "rand",
        rolls: 3,
      }
      const cmd = new MetStatic(interaction)

      const result = cmd.judge(["win", "tie", "tie"])

      expect(result).toMatch("accepted")
    })

    it("returns awful with more than half losses", () => {
      interaction.command_options = {
        description: "sacrifice",
        vs: "rand",
        rolls: 3,
      }
      const cmd = new MetStatic(interaction)

      const result = cmd.judge(["lose", "win", "lose"])

      expect(result).toMatch("angers")
    })
  })
})
