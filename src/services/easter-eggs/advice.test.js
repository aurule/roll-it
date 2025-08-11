const { i18n } = require("../../locales")

const advice = require("./advice")

describe("advice easter egg", () => {
  describe("showAdvice", () => {
    it("returns a boolean", () => {
      const result = advice.showAdvice()

      expect([true, false]).toContain(result)
    })
  })

  describe("message", () => {
    it("gets a random message", () => {
      const messages = i18n.t("easter-eggs.advice.messages", { returnObjects: true })

      const result = advice.message("en-US")

      expect(messages).toContain(result)
    })
  })
})
