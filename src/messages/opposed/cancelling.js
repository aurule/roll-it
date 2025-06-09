const { TextDisplayBuilder, SeparatorBuilder, ActionRowBuilder, MessageFlags, SectionBuilder } = require("discord.js")
const { Opposed } = require("../../db/opposed")
const { i18n } = require("../../locales")
const withdraw_button = require("../../components/opposed/withdraw-retest-button")
const cancel_picker = require("../../components/opposed/cancel-picker")
const cancel_button = require("../../components/opposed/cancel-button")
const continue_button = require("../../components/opposed/continue-button")

module.exports = {
  state: "cancelling",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const test = opposed_db.getLatestTestWithParticipants(challenge_id)

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed.cancelling")

    const reason = test.retest_reason

    const components = [
      new TextDisplayBuilder({
        content: t(`headline.${reason}`, { retester: test.retester.mention, ability: challenge.retest_ability }),
      }),
      new SectionBuilder({
        components: [
          new TextDisplayBuilder({
            content: t("withdraw"),
          })
        ],
        accessory: withdraw_button.data(challenge.locale),
      }),
      new SeparatorBuilder(),
      new TextDisplayBuilder({
        content: t("cancel", { canceller: test.canceller.mention }),
      }),
    ]

    console.log(test.canceller)
    if (test.canceller.advantages.includes("cancels")) {
      components.push(
        new ActionRowBuilder({
          components: [
            cancel_picker.data(challenge.locale),
          ],
        })
      )
      components.push(
        new TextDisplayBuilder({
          content: t("disclaimer")
        })
      )
    }

    components.push(
      new ActionRowBuilder({
        components: [
          cancel_button.data(challenge.locale),
          continue_button.data(challenge.locale),
        ],
      }),
    )

    const t_args = {
      summary: challenge.summary,
    }
    return {
      withResponse: true,
      flags: MessageFlags.IsComponentsV2,
      components,
    }
  },
  inert: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const test = opposed_db.getLatestTestWithParticipants(challenge_id)
    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    const reason = test.retest_reason
    return {
      withResponse: true,
      flags: MessageFlags.IsComponentsV2,
      components: [
        new TextDisplayBuilder({
          content: t(`headline.${reason}`, { retester: test.retester.mention, ability: challenge.retest_ability }),
        }),
      ]
    }
  }
}
