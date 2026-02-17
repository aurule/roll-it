vitest.mock("../util/message-builders")

import { Interaction } from "../../testing/interaction.js"
import { Sra } from "./sra.js"

describe("/sra command", () => {
  describe("schema", () => {
    describe("risk", () => {
      const risk_schema = Sra.schema.extract("risk")

      it("is optional", () => {
        const risk_value = undefined

        const result = risk_schema.validate(risk_value)

        expect(result.error).toBeFalsy()
      })

      it("is an integer", () => {
        const risk_value = 1.5

        const result = risk_schema.validate(risk_value)

        expect(result.error).toBeTruthy()
      })

      it("must be at least 1", () => {
        const risk_value = 0

        const result = risk_schema.validate(risk_value)

        expect(result.error).toBeTruthy()
      })

      it("must be at most 1000", () => {
        const risk_value = 1001

        const result = risk_schema.validate(risk_value)

        expect(result.error).toBeTruthy()
      })

      it.concurrent.each([[1], [15], [100]])("allows normal value %i", async (val) => {
        const risk_value = val

        const result = risk_schema.validate(risk_value)

        expect(result.error).toBeFalsy()
      })
    })

    describe("with", () => {
      const with_schema = Sra.schema.extract("with")

      it("is optional", () => {
        const result = with_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it("rejects unknown values", () => {
        const result = with_schema.validate("nothing")

        expect(result.error).toBeTruthy()
      })

      it.concurrent.each([["advantage"], ["disadvantage"]])("accepts '%s'", async (value) => {
        const result = with_schema.validate(value)

        expect(result.error).toBeFalsy()
      })
    })
  })

  describe("judge", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    // biome-ignore format: visual table for readability
    it.concurrent.each([
      ["angers", 5, 12, 0,  1, 0],
      ["inad",   5, 12, 0,  3, 0],
      ["noted",  5, 12, 0,  4, 0],
      ["accept", 5, 12, 0,  6, 0],
      ["pleases",5, 12, 0,  8, 0],
      ["angers", 6, 12, 0,  0, 0],
      ["inad",   6, 12, 0,  1, 0],
      ["noted",  6, 12, 0,  2, 0],
      ["accept", 6, 12, 0,  3, 0],
      ["pleases",6, 12, 0,  4, 0],
      ["angers", 4, 12, 0,  1, 0],
      ["inad",   4, 12, 0,  3, 0],
      ["noted",  4, 12, 0,  6, 0],
      ["accept", 4, 12, 0,  8, 0],
      ["pleases",4, 12, 0, 12, 0],
    ])("%s\tthreshold %i\tdice %i\trisk %i\tsuccesses %i\tglitches %i", (judgement, threshold, pool, risk, successes, glitches) => {
      const sra_command = new Sra(interaction)

      const result = sra_command.judge({
        threshold,
        pool,
        risk,
        summed: [successes],
        glitches: [glitches],
      })

      expect(result).toMatch(judgement)
    })

    it("neutral with a glitch downgrades to bad", () => {
      const sra_command = new Sra(interaction)

      const result = sra_command.judge({
        threshold: 5,
        pool: 12,
        risk: 2,
        summed: [4],
        glitches: [1],
      })

      expect(result).toMatch("inad")
    })

    it("neutral with two glitches downgrades to awful", () => {
      const sra_command = new Sra(interaction)

      const result = sra_command.judge({
        threshold: 5,
        pool: 12,
        risk: 2,
        summed: [4],
        glitches: [2],
      })

      expect(result).toMatch("angers")
    })

    it("good with three glitches downgrades to awful", () => {
      const sra_command = new Sra(interaction)

      const result = sra_command.judge({
        threshold: 5,
        pool: 12,
        risk: 2,
        summed: [6],
        glitches: [3],
      })

      expect(result).toMatch("angers")
    })

    it("awful with a glitch remains awful", () => {
      const sra_command = new Sra(interaction)

      const result = sra_command.judge({
        threshold: 5,
        pool: 12,
        risk: 2,
        summed: [0],
        glitches: [1],
      })

      expect(result).toMatch("angers")
    })
  })

  describe("validate", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    it("errors on risk > pool", () => {
      interaction.command_options = {
        risk: 5,
        pool: 4,
      }
      const cmd = new Sra(interaction)

      const result = cmd.validate()

      expect(result).toMatch("cannot risk more dice")
    })
  })

  describe("perform", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    it("shows sacrifice easter egg if triggered", () => {
      interaction.command_options = {
        pool: 5,
        description: "sacrifice"
      }
      const cmd = new Sra(interaction)

      const result = cmd.perform()

      expect(result).toMatch("Your sacrifice")
    })
  })
})
