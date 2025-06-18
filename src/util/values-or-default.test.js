const { ComponentInteraction } = require("../../testing/component-interaction")

const { valuesOrDefault } = require("./values-or-default")

describe("valuesOrDefault", () => {
  describe("with no interaction values", () => {
    it("returns default", () => {
      const default_value = ["test"]
      const interaction = new ComponentInteraction("test_picker")

      const result = valuesOrDefault(interaction, default_value)

      expect(result).toEqual(default_value)
    })
  })

  describe("with empty interaction values", () => {
    it("returns default", () => {
      const default_value = ["test"]
      const interaction = new ComponentInteraction("test_picker")
      interaction.values = []

      const result = valuesOrDefault(interaction, default_value)

      expect(result).toEqual(default_value)
    })
  })

  describe("with non-empty interaction values", () => {
    it("returns default", () => {
      const default_value = ["test"]
      const interaction = new ComponentInteraction("test_picker")
      interaction.values = ["leaf"]

      const result = valuesOrDefault(interaction, default_value)

      expect(result).toEqual(interaction.values)
    })
  })
})
