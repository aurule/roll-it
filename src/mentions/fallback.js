const { randomInt } = require("mathjs")

const { i18n } = require("../locales")

module.exports = {
  canHandle(message) {
    return true
  },
  async handle(message) {
    if (message.author.id === process.env.CLIENT_ID) return

    if (message.mentions.users.size > 1) {
      await message.react("<:rolliteye:1362168653348470975>")
      return
    }

    const messages = i18n.t("easter-eggs.mention.messages", { returnObjects: true })
    const content = messages.at(randomInt(messages.length))

    return message.reply(content)
  },
}
