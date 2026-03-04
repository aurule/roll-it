vitest.mock("../util/message-builders")

import { Coin } from "./coin.js"

import { Interaction } from "../../testing/interaction.js"
import { schemaMessages } from "../../testing/schema-messages.js"

describe("/coin command", () => {
  let interaction

  beforeEach(() => {
    interaction = new Interaction()
  })

  describe("execute", () => {
    it("performs the roll", async () => {
      const coin_command = new Coin(interaction)
      const result = await coin_command.execute()

      expect(result.message.content).toMatch("flipped a coin")
    })
  })

  describe("judge", () => {
    let coin_command

    beforeEach(() => {
      coin_command = new Coin(interaction)
      coin_command.raw_results = [[1]]
    })

    it("returns empty string with no call", () => {
      coin_command.call = ""
      const result = coin_command.judge()

      expect(result).toEqual("")
    })

    it("returns good message when call matches result", () => {
      coin_command.call = "1"
      const result = coin_command.judge()

      expect(result).toMatch("accepted")
    })

    it("returns bad message when call does not match result", () => {
      coin_command.call = "2"
      const result = coin_command.judge()

      expect(result).toMatch("inadequate")
    })
  })

  describe("perform", () => {
    it("displays the description if present", () => {
      interaction.command_options = {
        description: "this is a test",
      }
      const coin_command = new Coin(interaction)

      const result = coin_command.perform()

      expect(result).toMatch("this is a test")
    })

    it("displays the call if present", () => {
      interaction.command_options = {
        call: "1",
      }
      const coin_command = new Coin(interaction)

      const result = coin_command.perform()

      expect(result).toMatch("called *heads*")
    })

    it("displays sacrifice easter egg", () => {
      interaction.command_options = {
        description: "sacrificing a chicken",
        call: "1",
      }
      const coin_command = new Coin(interaction)

      const result = coin_command.perform()

      expect(result).toMatch("Your sacrifice")
    })
  })

  describe("schema", () => {
    describe("call", () => {
      it("is optional", () => {
        const options = {}
        const result = Coin.schema.validate(options, {
          abortEarly: false,
        })

        expect(schemaMessages(result)).not.toMatch("call")
      })

      it.concurrent.each([["1"], ["2"]])("allows %s", async (call_value) => {
        const options = {
          call: call_value,
        }
        const result = Coin.schema.validate(options, {
          abortEarly: false,
        })

        expect(schemaMessages(result)).not.toMatch("call")
      })

      it("disallows other values", () => {
        const options = {
          call: "nopealope",
        }
        const result = Coin.schema.validate(options, {
          abortEarly: false,
        })

        expect(schemaMessages(result)).toMatch("must be")
      })
    })
  })
})
