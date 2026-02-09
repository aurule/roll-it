import { i18n } from "../../locales/index.js"

import { showAdvice, message } from "./advice.js"

describe("advice easter egg", () => {
  describe("showAdvice", () => {
    it("returns a boolean", () => {
      const result = showAdvice()

      expect([true, false]).toContain(result)
    })
  })

  describe("message", () => {
    it("gets a random message", () => {
      const messages = i18n.t("easter-eggs.advice.messages", { returnObjects: true })

      const result = message("en-US")

      expect(messages).toContain(result)
    })
  })
})
