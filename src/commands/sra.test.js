jest.mock("../util/message-builders")

const { Interaction } = require("../../testing/interaction")
const { test_secret_option } = require("../../testing/shared/execute-secret")
const { ShadowrunPresenter } = require("../presenters/results/shadowrun-results-presenter")

const sra_command = require("./sra")

describe("/sra command", () => {
  describe("schema", () => {
    describe("risk", () => {
      const risk_schema = sra_command.schema.extract("risk")

      it("is optional", () => {
        const risk_value = undefined

        const result = risk_schema.validate(risk_value, {
          abortEarly: false,
        })

        expect(schemaMessages(result)).not.toMatch("rolls")
      })

      it("is an integer", () => {
        const risk_value = 1.5

        const result = risk_schema.validate(risk_value, {
          abortEarly: false,
        })

        expect(schemaMessages(result)).toMatch("whole number")
      })

      it("must be at least 1", () => {
        const risk_value = 0

        const result = risk_schema.validate(risk_value, {
          abortEarly: false,
        })

        expect(schemaMessages(result)).toMatch("between")
      })

      it("must be at most 1000", () => {
        const risk_value = 1001

        const result = risk_schema.validate(risk_value, {
          abortEarly: false,
        })

        expect(schemaMessages(result)).toMatch("between")
      })

      it.concurrent.each([[1], [15], [100]])("allows normal value %i", async (val) => {
        const risk_value = val

        const result = risk_schema.validate(risk_value, {
          abortEarly: false,
        })

        expect(schemaMessages(result)).toBeFalsy()
      })
    })

    describe("with", () => {
      const with_schema = sra_command.schema.extract("with")

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
    it.concurrent.each([
      ["awful",   5, 12, 0,  1, 0],
      ["bad",     5, 12, 0,  3, 0],
      ["neutral", 5, 12, 0,  4, 0],
      ["good",    5, 12, 0,  6, 0],
      ["great",   5, 12, 0,  8, 0],
      ["awful",   6, 12, 0,  0, 0],
      ["bad",     6, 12, 0,  1, 0],
      ["neutral", 6, 12, 0,  2, 0],
      ["good",    6, 12, 0,  3, 0],
      ["great",   6, 12, 0,  4, 0],
      ["awful",   4, 12, 0,  1, 0],
      ["bad",     4, 12, 0,  3, 0],
      ["neutral", 4, 12, 0,  6, 0],
      ["good",    4, 12, 0,  8, 0],
      ["great",   4, 12, 0, 12, 0],
    ])("%s: threshold %i with %i dice risking %i, scoring %i successes and %i glitches", (judgement, threshold, pool, risk, successes, glitches) => {
      const result = sra_command.judge({
        threshold,
        pool,
        risk,
        successes,
        glitches,
      })

      expect(result).toEqual(judgement)
    })

    it.todo("neutral with a glitch downgrades to bad")
    it.todo("neutral with two glitches downgrades to awful")
    it.todo("good with three glitches downgrades to awful")
    it.todo("awful with a glitch remains awful")
  })

  describe("perform", () => {
    //
  })

  describe("execute", () => {
    // 
  })
})
