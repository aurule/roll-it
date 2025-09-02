const ready = require("./client-ready")

const { logger } = require("../util/logger")
jest.mock("discord.js")

describe("Ready event handler", () => {
  describe("properties", () => {
    it("attaches to the event name 'clientReady'", () => {
      expect(ready.name).toBe("clientReady")
    })

    it("runs once", () => {
      expect(ready.once).toBe(true)
    })
  })

  describe("execute", () => {
    it("logs a ready notice", () => {
      const spy = jest.spyOn(logger, "info")
      const client = {
        user: {
          tag: "test",
        },
      }

      ready.execute(client)

      expect(spy).toHaveBeenCalled()
    })
  })
})
