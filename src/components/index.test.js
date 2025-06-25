const { handle } = require("./index")

describe("component dispatching", () => {
  describe("handle", () => {
    it("calls first handler that can accept the interaction", async () => {
      const handler1 = {
        canHandle: _interaction => true,
        handle: _interaction => "one"
      }
      const handler2 = {
        canHandle: _interaction => true,
        handle: _interaction => "two"
      }

      const result = await handle({}, [handler2, handler2])

      expect(result).toEqual("two")
    })

    it("returns false if no handler takes the interaction", async () => {
      const handler1 = {
        canHandle: _interaction => false,
        handle: _interaction => "one"
      }
      const handler2 = {
        canHandle: _interaction => false,
        handle: _interaction => "two"
      }

      const result = await handle({}, [handler2, handler2])

      expect(result).toEqual(false)
    })
  })
})
