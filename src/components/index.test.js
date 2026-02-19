import { handlers } from "./index.js"

describe("component dispatching", () => {
  describe("components", () => {
    it("each has a unique ID", () => {
      const all_handler_names = handlers.flatMap((h) => h.components.map((c) => c.name))
      const unique_handler_names = new Set(all_handler_names)

      expect(all_handler_names).toHaveLength(unique_handler_names.size)
    })
  })
})
