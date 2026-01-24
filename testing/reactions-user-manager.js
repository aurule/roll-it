import { Collection } from "discord.js"

export class ReactionsUserManager {
  constructor(users = []) {
    this.users = new Collection(users.map((u) => [u.id, u]))
  }

  async fetch(opts) {
    return this.users
  }
}
