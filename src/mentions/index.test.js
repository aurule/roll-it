import { FallbackMentionHandler } from "./fallback"
import { MentionHandler } from "./mention-handler.js"

import { handle } from "./index.js"


class Handler1 extends MentionHandler {
  static canHandle(_message) {
    return false
  }

  async handle() {
    return "one"
  }
}

class Handler2 extends MentionHandler {
  static canHandle(_message) {
    return true
  }

  async handle() {
    return "two"
  }
}

describe("message mention dispatching", () => {
  describe("handle", () => {
    it("calls the first handler that can take the message", async () => {
      const result = await handle({}, [Handler1, Handler2])

      expect(result).toEqual("two")
    })

    it.only("calls the fallback handler if nothing else takes the message", async () => {
      const fallback_spy = vitest.spyOn(FallbackMentionHandler.prototype, "handle")

      await handle(
        {
          author: { id: "test_user" },
          mentions: {
            users: [],
          },
          reply: () => false,
        },
        [Handler1],
      )

      expect(fallback_spy).toHaveBeenCalled()
    })
  })
})
