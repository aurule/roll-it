const { Emoji } = require("./emoji")

class Reaction {
  constructor(emoji_text, count) {
    this.emoji = new Emoji(emoji_text)
    this.count = count
    if (!count) {
      this.count = 1
    }
  }
}

module.exports = {
  Reaction,
}
