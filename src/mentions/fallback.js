import { randomInt } from "mathjs"

import { MentionHandler } from "./mention-handler.js"
import { i18n } from "../locales/index.js"
import { hasTrigger } from "../services/easter-eggs/sacrifice.js"

/**
 * Fallback message mention handler
 */
export class FallbackMentionHandler extends MentionHandler {
  /**
   * Translation function
   *
   * @type i18next.t
   */
  t

  /**
   * Create a new FallbackMentionHandler
   * @param  {Message}                message The Discord message object to handle
   * @return {FallbackMentionHandler}         New handler object
   */
  constructor(message) {
    super(message)
    this.t = i18n.getFixedT(message.locale)
  }

  /**
   * Determine whether this mention handler can handle a given message
   *
   * Since this is the fallback handler, this always returns true
   *
   * @param  {Message} _message The message to test. Ignored.
   * @return {boolean}          Always returns true
   */
  static canHandle(_message) {
    return true
  }

  /**
   * Handle the message
   *
   * When replying to a message, Discord sends us the author of the replied-to message as a mention alongside
   * any other @mention'd users in the message.
   *
   * If we are not the only user mentioned, we politely add a react instead of cluttering the chat history. If
   * we _are_ the only mention, then we can reply with our own message.
   *
   * @return {Promise} Message react or response promise
   */
  async handle() {
    if (this.message.author.id === process.env.CLIENT_ID) {
      return
    }

    if (this.message.mentions.users.size > 1) {
      return this.message.react("<:rolliteye:1362168653348470975>")
    }

    const t_args = {
      returnObjects: true,
      context: hasTrigger(this.message, this.locale) ? "sacrifice" : undefined,
    }
    const messages = this.t("easter-eggs.mention.messages", t_args)
    const content = messages.at(randomInt(messages.length))

    return this.reply(content)
  }

  async react(emoji) {
    return this.message.react(emoji)
  }
}
