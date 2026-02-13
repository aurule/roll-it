import "./8ball.js"
import { Help } from "./help.js"

describe("/help", () => {
  describe("help_data", () => {
    it("includes topic names", () => {
      const help_data = Help.help_data({ locale: "en-US" })

      expect(help_data.topics.some((t) => t.includes("About Roll It"))).toBeTruthy()
    })

    it("includes command names", () => {
      const help_data = Help.help_data({ locale: "en-US" })

      expect(help_data.commands.some((c) => c.includes("8ball"))).toBeTruthy()
    })
  })
})
