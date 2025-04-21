const { Message } = require("../../testing/message")
const { Interaction } = require("../../testing/interaction")

const MessageCreate = require("./messageCreate")

describe("MessageCreate event handler", () => {
  describe("with a message that does not reference the bot", () => {
    it("ignores the message", async () => {
      const message = new Message()
      message.mentions = {
        users: new Map()
      }

      const result = await MessageCreate.execute(message)

      expect(result).toMatch("does not mention bot")
    })
  })

  describe("with a message in the wrong guild", () => {
    it("ignores the message", async () => {
      const message = new Message({guildId: process.env.DEV_GUILDS[0]})
      message.mentions = {
        users: new Map([[process.env.CLIENT_ID, "yes"]])
      }

      const result = await MessageCreate.execute(message)

      expect(result).toMatch("wrong guild")
    })
  })

  describe("with a message in the correct guild that references the bot", () => {
    it("responds to the message", async () => {
      const interaction = new Interaction()
      const message = interaction.message
      message.mentions = {
        users: new Map([[process.env.CLIENT_ID, "yes"]])
      }
      jest.spyOn(message, "reply")

      await MessageCreate.execute(message)

      expect(message.reply).toHaveBeenCalled()
    })
  })
})
