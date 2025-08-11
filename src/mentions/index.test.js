const fallback_handler = require("./fallback")

const { handle } = require("./index")

describe("message mention dispatching", () => {
  describe("handle", () => {
    it("calls the first handler that can take the message", async () => {
      const handler1 = {
        canHandle: (_interaction) => false,
        handle: (_interaction) => "one",
      }
      const handler2 = {
        canHandle: (_interaction) => true,
        handle: (_interaction) => "two",
      }

      const result = await handle({}, [handler1, handler2])

      expect(result).toEqual("two")
    })

    it("calls the fallback handler if nothing else takes the message", async () => {
      const handler1 = {
        canHandle: (_interaction) => false,
        handle: (_interaction) => "one",
      }
      const handler2 = {
        canHandle: (_interaction) => false,
        handle: (_interaction) => "two",
      }
      const fallback_spy = jest.spyOn(fallback_handler, "handle")

      await handle(
        {
          author: { id: "test_user" },
          mentions: {
            users: [],
          },
          reply: () => false,
        },
        [handler1, handler2],
      )

      expect(fallback_spy).toHaveBeenCalled()
    })
  })
})
