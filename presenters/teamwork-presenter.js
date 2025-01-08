const {
  userMention,
  time,
  TimestampStyles,
  hyperlink,
  EmbedBuilder,
  inlineCode,
} = require("discord.js")
const { oneLine } = require("common-tags")

const { timeout_ms } = require("../util/teamwork-settings")
const { messageLink } = require("../util/formatters")

module.exports = {
  helperPromptMessage(userFlake, t, description) {
    const expiry = new Date(Date.now() + timeout_ms)
    const lines = []
    if (description) {
      lines.push(
        t("helper.prompt.withDescription", { leader: userMention(userFlake), description }),
      )
    } else {
      lines.push(t("helper.prompt.withoutDescription", { leader: userMention(userFlake) }))
    }
    lines.push("")
    lines.push(
      t("helper.prompt.p2", {
        leader: userMention(userFlake),
        timeout: time(expiry, TimestampStyles.RelativeTime),
      }),
    )
    return lines.join("\n")
  },
  helperProgressEmbed(bonuses, requested, t) {
    const embed = new EmbedBuilder().setColor("#03b199").setTitle(t("helper.embed.title"))

    const iconChooser = (snowflake) => {
      return bonuses.hasAny(snowflake) ? ":white_check_mark:" : ":x:"
    }

    if (requested.length > 0) {
      embed.addFields({
        name: t("helper.embed.pending"),
        value: requested.map((user) => `${iconChooser(user)} ${userMention(user)}`).join("\n"),
        inline: false,
      })
    }
    if (bonuses.size) {
      embed.addFields({
        name: t("helper.embed.submitted"),
        value: bonuses.map((bonus, user) => `+${bonus} ${userMention(user)}`).join("\n"),
        inline: false,
      })
    }
    return embed
  },
  helperRolledMessage(userFlake, description, resultMessage, t) {
    let parts = []
    if (description) {
      parts.push(
        t("helper.finished.withDescription", { leader: userMention(userFlake), description }),
      )
    } else {
      parts.push(t("helper.finished.withoutDescription", { leader: userMention(userFlake) }))
    }
    const link = hyperlink(t("helper.finished.reference.linkText"), messageLink(resultMessage))
    parts.push(t("helper.finished.reference.plainText", { link }))
    return parts.join(" ")
  },
  helperCancelledMessage(userFlake, description, t) {
    if (description) {
      return t("helper.cancelled.withDescription", { leader: userMention(userFlake), description })
    }
    return t("helper.cancelled.withoutDescription", { leader: userMention(userFlake) })
  },
  helperTimeoutMessage(userFlake, description, t) {
    if (description) {
      return t("helper.timeout.withDescription", { leader: userMention(userFlake), description })
    }
    return t("helper.timeout.withoutDescription", { leader: userMention(userFlake) })
  },
  leaderPromptMessage(userFlake, t) {
    const expiry = new Date(Date.now() + timeout_ms)
    return [
      t("leader.prompt.p1", { leader: userMention(userFlake) }),
      t("leader.prompt.p2", { timeout: time(expiry, TimestampStyles.RelativeTime) }),
    ].join("\n")
  },
  teamworkSummaryMessage(leaderRollSummary, promptMessage, t) {
    const link = hyperlink(t("response.summary.linkText"), messageLink(promptMessage))
    const lines = [leaderRollSummary, t("response.summary.body", { link })]
    return lines.join("\n")
  },
  contributorEmbed(userFlake, initialPool, bonuses, t) {
    const embed = new EmbedBuilder().setColor("#03b199").addFields({
      name: t("response.embed.leader.header"),
      value: t("response.embed.leader.body", { leader: userMention(userFlake), pool: initialPool }),
      inline: false,
    })

    if (bonuses.size) {
      embed.addFields({
        name: t("response.embed.helpers.header"),
        value: bonuses
          .map((bonus, helperFlake) =>
            t("response.embed.helpers.line", { bonus, helper: userMention(helperFlake) }),
          )
          .join("\n"),
        inline: false,
      })
    }

    return embed
  },
}
