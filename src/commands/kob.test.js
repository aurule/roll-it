vitest.mock("../util/message-builders")

import { Kob } from "./kob.js"

import { Interaction } from "../../testing/interaction.js"

describe("/kob command", () => {
  let interaction

  beforeEach(() => {
    interaction = new Interaction()
  })

  describe("schema", () => {
    describe("sides", () => {
      const sides_schema = Kob.schema.extract("sides")

      it("is required", () => {
        const result = sides_schema.validate()

        expect(result.error).toBeTruthy()
      })

      it("is an integer", () => {
        const result = sides_schema.validate(1.5)

        expect(result.error).toBeTruthy()
      })

      it.concurrent.each([[4], [6], [8], [10], [12], [20], [100]])("allows %i", async (die) => {
        const result = sides_schema.validate(die)

        expect(result.error).toBeFalsy()
      })

      it("disallows other values", () => {
        const result = sides_schema.validate(15)

        expect(result.error).toBeTruthy()
      })
    })
  })
})
