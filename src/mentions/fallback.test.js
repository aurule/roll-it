import { Interaction } from "../../testing/interaction.js"

import { FallbackMentionHandler } from "./fallback"

describe("Fallback message mention handler", () => {
  describe("canHandle", () => {
    it("always returns true", () => {
      const result = FallbackMentionHandler.canHandle("I'm not actually a message")

      expect(result).toEqual(true)
    })
  })

  describe("handle", () => {
    it("ignores messages from the bot", async () => {
      const interaction = new Interaction({
        userId: process.env.CLIENT_ID,
      })
      const message = interaction.message
      message.mentions = {
        users: new Map([[process.env.CLIENT_ID, "yes"]]),
      }
      message.author.id = process.env.CLIENT_ID
      vitest.spyOn(message, "reply")
      vitest.spyOn(message, "react")
      const handler = new FallbackMentionHandler(message)

      await handler.handle(message)

      expect(message.reply).not.toHaveBeenCalled()
      expect(message.react).not.toHaveBeenCalled()
    })

    describe("when other users are also mentioned", () => {
      it("reacts", async () => {
        const interaction = new Interaction({
          userId: process.env.CLIENT_ID,
        })
        const message = interaction.message
        message.mentions = {
          users: new Map([
            [process.env.CLIENT_ID, "yes"],
            ["somebody_else", "yes"],
          ]),
        }
        vitest.spyOn(message, "react")
        const handler = new FallbackMentionHandler(message)

        await handler.handle()

        expect(message.react).toHaveBeenCalled()
      })
    })

    describe("when mentioned alone", () => {
      it("replies", async () => {
        const interaction = new Interaction({
          userId: process.env.CLIENT_ID,
        })
        const message = interaction.message
        message.mentions = {
          users: new Map([[process.env.CLIENT_ID, "yes"]]),
        }
        vitest.spyOn(message, "reply")
        const handler = new FallbackMentionHandler(message)

        await handler.handle()

        expect(message.reply).toHaveBeenCalled()
      })
    })
  })
})
