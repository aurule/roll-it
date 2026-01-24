import { simpleflake } from "simpleflakes"
import { userMention } from "discord.js"

export class User {
  constructor(snowflake) {
    this.flake = snowflake ?? simpleflake()

    this.id = this.flake.toString()
    this.bot = false
    this.username = "Test User"
  }

  toString() {
    return userMention(this.id)
  }
}
