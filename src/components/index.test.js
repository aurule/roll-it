import { handle, handlers } from "./index.js"

describe("component dispatching", () => {
  describe("handle", () => {
    it("calls first handler that can accept the interaction", async () => {
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

    it("returns false if no handler takes the interaction", async () => {
      const handler1 = {
        canHandle: (_interaction) => false,
        handle: (_interaction) => "one",
      }
      const handler2 = {
        canHandle: (_interaction) => false,
        handle: (_interaction) => "two",
      }

      const result = await handle({}, [handler1, handler2])

      expect(result).toEqual(false)
    })
  })

  describe("components", () => {
    it("each has a unique ID", () => {
      const all_handler_names = handlers.flatMap((h) => h.components.map((c) => c.name))
      const unique_handler_names = new Set(all_handler_names)

      expect(all_handler_names).toHaveLength(unique_handler_names.size)
    })
  })
})
