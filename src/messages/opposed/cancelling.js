const { Opposed } = require("../../db/opposed")
const { i18n } = require("../../locales")
const withdraw_button = require("../../components/opposed/withdraw-retest-button")
const cancel_picker = require("../../components/opposed/cancel-picker")
const cancel_button = require("../../components/opposed/cancel-button")
const continue_button = require("../../components/opposed/continue-button")
const build = require("../../util/message-builders")
const { Participant } = require("../../db/opposed/participant")

/**
 * Message shown to allow cancelling an ability retest
 */
module.exports = {
  state: "cancelling",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const test = opposed_db.getLatestTest(challenge_id)

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed.cancelling")

    const reason = test.retest_reason

    const components = [
      build.text(
        t(`headline.${reason}`, {
          retester: test.retester.mention,
          ability: challenge.retest_ability,
        }),
      ),
      build.section(t("withdraw"), withdraw_button.data(challenge.locale)),
      build.separator(),
      build.text(t("cancel", { canceller: test.canceller.mention })),
    ]

    if (test.canceller.advantages.includes(Participant.Advantages.Cancels)) {
      components.push(build.actions(cancel_picker.data(challenge.locale)))
      components.push(build.text(t("disclaimer")))
    }

    components.push(
      build.actions(cancel_button.data(challenge.locale), continue_button.data(challenge.locale)),
    )

    return build.message(components, { withResponse: true })
  },
  inert: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const test = opposed_db.getLatestTest(challenge_id)
    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed.cancelling")

    // if state is throwing, return headline
    // if state is otherwise, add withdrawn

    const body = [
      t(`headline.${test.retest_reason}`, {
        retester: test.retester.mention,
        ability: challenge.retest_ability,
      }),
      t("withdrawn"),
    ].join(" ")

    return build.textMessage(body,
      { withResponse: true },
    )
  },
}
