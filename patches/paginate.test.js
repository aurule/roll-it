const paginate = require("./paginate")

const { CommandInteraction } = require("discord.js")

class PatchMePaginate {
  messages = []

  reply(args) {
    this.messages.push(args)
    return args
  }

  followUp(args) {
    return this.reply(args)
  }
}

describe("patch", () => {
  it("targets the base command class by default", () => {
    paginate.patch()

    expect(CommandInteraction.prototype.paginate).not.toBeUndefined()
  })
})

describe("paginate", () => {
  beforeAll(() => {
    paginate.patch(PatchMePaginate)
  })

  describe("with a short message", () => {
    it("sends one reply", async () => {
      const fake = new PatchMePaginate()

      await fake.paginate({
        content: "I am surprisingly short, actually.",
        max_length: 100,
      })

      expect(fake.messages.length).toEqual(1)
    })

    it("sends ephemeral if given", async () => {
      const fake = new PatchMePaginate()

      await fake.paginate({
        content: "I am surprisingly short, actually.",
        max_length: 100,
        ephemeral: true,
      })

      expect(fake.messages[0].ephemeral).toEqual(true)
    })
  })

  describe("with a long message", () => {
    it("sends multiple replies", async () => {
      const fake = new PatchMePaginate()

      await fake.paginate({
        content: "I am surprisingly long, actually. I know, it's a real surprise, but truly I have over 100 characters!",
        max_length: 100,
      })

      expect(fake.messages.length).toEqual(2)
    })

    it("sends ephemeral on each message", async () => {
      const fake = new PatchMePaginate()

      await fake.paginate({
        content: "I am surprisingly long, actually. I know, it's a real surprise, but truly I have over 100 characters!",
        max_length: 100,
        ephemeral: true,
      })

      expect(fake.messages[0].ephemeral).toEqual(true)
      expect(fake.messages[1].ephemeral).toEqual(true)
    })
  })
})

describe("splitMessage", () => {
  it("returns a single message when it's short", () => {
    const message = "I am surprisingly short"
    const length = 100

    const result = paginate.splitMessage(message, undefined, length)

    expect(result.length).toEqual(1)
  })

  it("caps messages at length", () => {
    const message = "I am surprisingly short"
    const length = 100

    const result = paginate.splitMessage(message, undefined, length)

    for (const m of result) {
      expect(m.length).toBeLessThanOrEqual(length)
    }
  })

  it("splits at the separator", () => {
    const message =
      "I am surprisingly long, actually. I know, it's a real surprise, but truly I have over 100 characters!"
    const length = 100

    const result = paginate.splitMessage(message, " ", length)

    expect(result).toEqual([
      "I am surprisingly long, actually. I know, it's a real surprise, but truly I…\n-# (message 1/2)",
      "…have over 100 characters!\n-# (message 2/2)",
    ])
  })
})

describe("prefixer", () => {
  it("returns empty string for page 1", () => {
    const result = paginate.prefixer(1)

    expect(result).toEqual("")
  })

  it("returns ellipsis for page 2+", () => {
    const result = paginate.prefixer(2)

    expect(result).toEqual("…")
  })
})

describe("suffixer", () => {
  it("shows page number", () => {
    const result = paginate.suffixer(2, 3)

    expect(result).toMatch("2/")
  })

  it("shows max pages", () => {
    const result = paginate.suffixer(2, 3)

    expect(result).toMatch("/3")
  })

  it("includes ellipsis on non-final messages", () => {
    const result = paginate.suffixer(2, 3)

    expect(result).toMatch("…")
  })

  it("omits ellipsis on final message", () => {
    const result = paginate.suffixer(3, 3)

    expect(result).not.toMatch("…")
  })
})
