const { Collection } = require("discord.js")

class ReactionsUserManager {
  constructor(users = []) {
    this.users = new Collection(users.map((u) => [u.id, u]))
  }

  async fetch(opts) {
    return this.users
  }
}

module.exports = {
  ReactionsUserManager,
}
