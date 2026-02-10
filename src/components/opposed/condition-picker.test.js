vitest.mock("../../util/message-builders")

import { ChallengeFixture } from "../../../testing/challenge-fixture.js"
import { Interaction } from "../../../testing/interaction.js"
import { Challenge } from "../../db/opposed/challenge.js"

import conditionPicker from "./condition-picker.js"

describe("challenge condition selector", () => {
  describe("data", () => {
    it("has a descriptive placeholder", () => {
      const selector = conditionPicker.data("en-US")

      expect(selector.data.placeholder).toMatch("Not carrier or altering")
    })

    it.concurrent.each([["carrier"], ["altering"]])("includes the %s option", (condition) => {
      const selector = conditionPicker.data("en-US")

      const option_names = selector.options.map((o) => o.data.value)
      expect(option_names).toContain(condition)
    })

    it("allows zero values", () => {
      const selector = conditionPicker.data("en-US")

      expect(selector.data.min_values).toEqual(0)
    })

    it("allows three values", () => {
      const selector = conditionPicker.data("en-US")

      expect(selector.data.max_values).toEqual(2)
    })
  })

  describe("execute", () => {
    let interaction
    let challenge
    let participant

    beforeEach(() => {
      interaction = new Interaction()
      challenge = new ChallengeFixture(Challenge.States.AttackerAdvantages).attachMessage(
        interaction.message.id,
      )
      participant = challenge.addAttacker()
      interaction.user.id = participant.uid

      const selector = conditionPicker.data("en-US")
      interaction.customId = selector.data.custom_id
    })

    describe("authorization", () => {
      it("allows attacking user", async () => {
        await expect(conditionPicker.execute(interaction)).resolves.not.toThrow()
      })

      it("disallows all others", async () => {
        interaction.user.id = "other"

        expect(() => conditionPicker.execute(interaction)).toThrow()
      })
    })

    describe("with no selection", () => {
      beforeEach(() => {
        challenge.setConditions([Challenge.Conditions.Carrier])
      })

      it("sets advantages to ['normal']", async () => {
        await conditionPicker.execute(interaction)

        expect(challenge.record.conditions).toEqual([Challenge.Conditions.Normal])
      })
    })

    describe("with selected advantages", () => {
      beforeEach(() => {
        challenge.setConditions([Challenge.Conditions.Carrier])
        interaction.values = [Challenge.Conditions.Altering]
      })

      it("saves advantages", async () => {
        await conditionPicker.execute(interaction)

        expect(challenge.record.conditions).toEqual([Challenge.Conditions.Altering])
      })
    })
  })
})
