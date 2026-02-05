import { patch, patchDiscord } from "./authorize.js"

const {
  ButtonInteraction,
  UserSelectMenuInteraction,
  StringSelectMenuInteraction,
} = require("discord.js")

class PatchMeAuthorize {
  user

  constructor(user_id) {
    this.user = {
      id: user_id,
    }
  }

  reply(args) {
    return args
  }
}

class PatchMeAuthorizeMessage {
  author

  constructor(author_id) {
    this.author = {
      id: author_id,
    }
  }

  reply(args) {
    return args
  }
}

describe("authorize helper", () => {
  describe("default patches", () => {
    beforeAll(() => {
      patchDiscord()
    })

    it.concurrent.each([
      [ButtonInteraction],
      [UserSelectMenuInteraction],
      [StringSelectMenuInteraction],
    ])("patches %p by default", async (klass) => {
      expect(klass.prototype.authorize).not.toBeUndefined()
    })
  })

  describe("authorize", () => {
    beforeAll(() => {
      patch(PatchMeAuthorize)
      patch(PatchMeAuthorizeMessage)
    })

    describe("with an allowed user", () => {
      it("is a noop", () => {
        const fake = new PatchMeAuthorize("test user")

        expect(() => fake.authorize("test user", "also me")).not.toThrow()
      })
    })

    describe("with a non-allowed user", () => {
      it("throws an error", () => {
        const fake = new PatchMeAuthorize("test user")

        expect(() => fake.authorize("only me")).toThrow("not allowed")
      })
    })

    describe("with an allowed author", () => {
      it("is a noop", () => {
        const fake = new PatchMeAuthorizeMessage("test author")

        expect(() => fake.authorize("test author", "also me")).not.toThrow()
      })
    })

    describe("with a non-allowed author", () => {
      it("throws an error", () => {
        const fake = new PatchMeAuthorizeMessage("test author")

        expect(() => fake.authorize("only me")).toThrow("not allowed")
      })
    })
  })
})
