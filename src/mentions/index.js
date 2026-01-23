import { FallbackMentionHandler } from "./fallback.js"
import { OpposedMentionHandler } from "./opposed.js"
import { TeamworkMentionHandler } from "./teamwork.js"

/**
 * Array of message mention handlers
 *
 * @type {MentionHandler[]}
 */
export const handlers = [
  OpposedMentionHandler,
  TeamworkMentionHandler,
  FallbackMentionHandler, // This must always be last
]

/**
 * Handle a message mention
 *
 * This can come from someone replying to a message from Roll It, or by mentioning Roll It explicitly within
 * a message's text.
 *
 * @param  {Message}          message           Message mentioning the bot user
 * @param  {MentionHandler[]} handlers_override Array of mention handler objects
 * @return {Promise}                            Promise resolving to the outcome of the handler, usually a Message object
 */
export async function handle(message, handlers_override) {
  const our_handlers = handlers_override ?? handlers
  for (const handler of our_handlers) {
    if (handler.canHandle(message)) return new handler(message).handle()
  }
}
