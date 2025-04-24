const { Interaction } = require("../../testing/interaction")

const Fallback = require("./fallback")

describe("Fallback message mention handler", () => {
  describe("canHandle", () => {
    it("always returns true", () => {
      const result = Fallback.canHandle("I'm not actually a message")

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
      jest.spyOn(message, "reply")
      jest.spyOn(message, "react")

      await Fallback.handle(message)

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
        jest.spyOn(message, "react")

        await Fallback.handle(message)

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
        jest.spyOn(message, "reply")

        await Fallback.handle(message)

        expect(message.reply).toHaveBeenCalled()
      })
    })
  })
})
