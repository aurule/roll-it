const { longReply, splitMessage, multiReply } = require("./long-reply")

const { Interaction } = require("../testing/interaction")

describe("splitMessage", () => {
  it("returns a single message when it's short", () => {
    const message = "I am surprisingly short"
    const length = 100

    const result = splitMessage(message, " ", length)

    expect(result.length).toEqual(1)
  })

  it("caps messages at length", () => {
    const message = "I am surprisingly short"
    const length = 100

    const result = splitMessage(message, " ", length)

    for (const m of result) {
      expect(m.length).toBeLessThanOrEqual(length)
    }
  })

  it("splits at the separator", () => {
    const message =
      "I am surprisingly long, actually. I know, it's a real surprise, but truly I have over 100 characters!"
    const length = 100

    const result = splitMessage(message, " ", length)

    expect(result).toEqual([
      "I am surprisingly long, actually. I know, it's a real surprise, but truly I...\n-# (message 1/2)",
      "...have over 100 characters!\n-# (message 2/2)",
    ])
  })
})

describe("multiReply", () => {
  describe("with one message", () => {
    it("sends one message", async () => {
      const i = new Interaction()
      const messages = ["pretty short, actually"]

      await multiReply(i, messages)

      expect(i.replies.length).toEqual(1)
      expect(i.replies[0].content).toEqual(messages[0])
    })

    it("includes options", async () => {
      const i = new Interaction()
      const messages = ["pretty short, actually"]
      const opts = { ephemeral: true }

      await multiReply(i, messages, opts)

      expect(i.replies[0].ephemeral).toBeTruthy()
    })
  })

  describe("with many messages", () => {
    it("sends all messages", async () => {
      const i = new Interaction()
      const messages = ["pretty short, actually", "although there are two of them"]

      await multiReply(i, messages)

      expect(i.replies.length).toEqual(2)
    })

    it("includes options in each reply", async () => {
      const i = new Interaction()
      const messages = ["pretty short, actually", "although there are two of them"]
      const opts = { ephemeral: true }

      await multiReply(i, messages, opts)

      expect(i.replies[0].ephemeral).toBeTruthy()
      expect(i.replies[1].ephemeral).toBeTruthy()
    })
  })
})
