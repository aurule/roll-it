import { userMention } from "discord.js"
import { MentionHandler } from "./mention-handler.js"
import { Opposed } from "../db/opposed.js"
import { i18n, available_locales } from "../locales/index.js"
import { logger } from "../util/logger.js"
import { afterRetryIndex, messageIndex, onReplyIndex } from "../messages/opposed/index.js"
import { UnauthorizedError } from "../errors/unauthorized-error.js"
import { sendError } from "../services/metrics.js"

/**
 * Basic list of retry trigger words across all locales
 * @type string[]
 */
export const RETRY_KEYWORDS = available_locales.map((locale) =>
  i18n.t("retry", { lng: locale, ns: "opposed" }),
)

/**
 * MET Opposed test message mention handler
 */
export class OpposedMentionHandler extends MentionHandler {
  t
  db
  referenced_message_uuid

  constructor(message) {
    super(message)
    this.t = i18n.getFixedT(message.locale, "opposed")
    this.db = new Opposed()
    this.referenced_message_uuid = message.reference.messageId
  }

  /**
   * Get whether this handler accepts a certain message
   *
   * To be handled, a message must appear in the opposed messages database.
   *
   * @param  {Message} interaction Discord message object
   * @return {boolean}             True if the message can be handled, false if not
   */
  static canHandle(message) {
    const opposed_db = new Opposed()
    return opposed_db.hasMessage(message.reference?.messageId)
  }

  /**
   * Handle a message
   *
   * This first handles the special "retry" logic to re-send the message for the challenge's current state. It
   * will call an `afterRetry` hook if present on the message.
   *
   * Otherwise, any message file with a `onReply` function will have it called with the interaction.
   */
  async handle() {
    const challenge = this.db.findChallengeByMessage(this.referenced_message_uuid)
    const replyMessage = messageIndex.get(challenge.state)

    if (this.isRetry) {
      return this.message.interaction.ensure("reply", replyMessage(challenge.id), {
        challenge_id: challenge.id,
        channel_id: this.message.channelId,
        detail: `failed to retry message for state "${challenge.state}"`,
      })
      .then(reply_response => {
        const message_uid = reply_response?.resource?.message?.id ?? reply_response.id

        const message_props = {
          challenge_id: challenge.id,
          message_uid,
          test_id: this.db.findTestByMessage(this.referenced_message_uuid)?.id ?? null,
        }
        this.db.addMessage(message_props)
        const afterRetry = afterRetryIndex.get(challenge.state)
        if (afterRetry !== undefined) {
          afterRetry(reply_response)
        }
      })
    }

    const onReply = onReplyIndex.get(challenge.state)
    if (onReply !== undefined) {
      try {
        return onReply(this.message.interaction)
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          logger.info({
            user: this.message.user,
            challenge,
            detail: "unauthorized message reply interaction",
          })
          return this.message.interaction.ensure(
            "whisper",
            this.t("unauthorized", {
              context: "mention",
              participants: err.allowed_uids.map(userMention),
            }),
            {
              user: this.message.user,
              message: this.message.message,
            },
          )
        } else {
          sendError(err, {
            user: this.message.user,
            challenge,
          })
          logger.error({
            err,
            user: this.message.user,
            challenge,
          })
        }
      }
    }

    return this.whisper(
      this.t("unknown"),
    )
  }

  /**
   * Get whether to use the retry logic
   * @return {boolean} True if we're re-sending, false if not
   */
  get isRetry() {
    return RETRY_KEYWORDS.includes(this.message.content)
  }
}
