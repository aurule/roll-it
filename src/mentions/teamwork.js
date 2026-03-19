import { userMention } from "discord.js"
import { Teamwork, MessageType } from "../db/teamwork.js"
import { i18n } from "../locales/index.js"
import { TeamworkChangeEmbed } from "../embeds/teamwork-change.js"
import { teamworkTimeout } from "../interactive/teamwork.js"
import { logger } from "../util/logging/setup.js"
import { messageLink } from "../util/formatters/message-link.js"
import { extractNumber } from "../util/extract-number.js"
import { MentionHandler } from "./mention-handler.js"
import { sendEvent } from "../services/metrics.js"

export class TeamworkMentionHandler extends MentionHandler {
  db
  referenced_message_uuid
  test

  constructor(message) {
    super(message)
    this.db = new Teamwork()
    this.referenced_message_uuid = message.reference.messageId
    this.test = this.db.findTestByMessage(this.referenced_message_uuid)
  }

  /**
   * Get whether this handler accepts a certain message
   *
   * To be handled, a message must appear in the teamwork messages database.
   *
   * @param  {Message} message Discord message object
   * @return {boolean}         True if the message can be handled, false if not
   */
  static canHandle(message) {
    const teamwork_db = new Teamwork()
    return teamwork_db.hasMessage(message.reference?.messageId)
  }

  /**
   * Handle a message
   *
   * This ensures that the message is tied to an active teamwork test, then adds or updates the message user's
   * helper record and shows a new summary of the test.
   */
  async handle() {
    sendEvent("message mention", this.message.author.id, {
      handler: this.constructor.name
    })
    if (this.test === undefined) {
      return this.whisper(i18n.t("concluded", { ns: "teamwork", lng: this.locale })).catch(
        (error) => {
          return logger.warn(
            {
              err: error,
              reply_to: this.referenced_message_uuid,
              message: this.message.id,
            },
            "Could not whisper about unknown test",
          )
        },
      )
    }

    const t = i18n.getFixedT(this.test.locale, "teamwork")

    if (this.test.expired) {
      await teamworkTimeout(this.test.id)
      return this.whisper(t("concluded")).catch((error) =>
        logger.warn(
          {
            err: error,
            test: this.test.id,
            reply_to: this.referenced_message_uuid,
            message: this.message.id,
          },
          "Could not whisper about expired test",
        ),
      )
    }

    const matched_number = extractNumber(this.message.content)
    if (matched_number === undefined) {
      return this.whisper(t("help_given.missing")).catch((error) =>
        logger.error(
          {
            err: error,
            test: this.test.id,
            reply_to: this.referenced_message_uuid,
            message: this.message.id,
          },
          "Could not whisper about missing number",
        ),
      )
    }

    if (Number.isNaN(matched_number)) {
      return this.whisper(t("help_given.invalid")).catch((error) =>
        logger.error(
          {
            err: error,
            test: this.test.id,
            reply_to: this.referenced_message_uuid,
            message: this.message.id,
          },
          "Could not whisper about invalid number",
        ),
      )
    }

    const author_id = this.message.author.id
    this.db.setDice(this.test.id, author_id, matched_number)

    const prompt_link = messageLink({
      id: this.db.getPromptUid(this.test.id),
      channelId: this.test.channel_uid,
      guildId: this.message.guildId,
    })
    const t_args = {
      helper: userMention(author_id),
      count: matched_number,
      context: author_id === this.test.leader ? "leader" : "helper",
      prompt_link,
    }
    const embed = new TeamworkChangeEmbed(test).data()

    return this.message
      .ensure(
        "reply",
        {
          content: t("help_given.success", t_args),
          embeds: [embed],
          allowedMentions: {
            users: [author_id],
          },
          withResponse: true,
        },
        {
          test: this.test.id,
          detail: "Could not reply with added dice",
        },
      )
      .then((reply_result) => {
        // expect an InteractionCallbackResponse, but deal with a Message too
        const message_uid = reply_result?.resource?.message?.id ?? reply_result.id

        this.db.addMessage({
          teamwork_id: this.test.id,
          message_uid: message_uid,
          type: MessageType.Plain,
        })
      })
  }
}
