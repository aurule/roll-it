import { EmbedBuilder, userMention } from "discord.js"
import { Teamwork } from "../db/teamwork.js"
import { i18n } from "../locales/index.js"
import { signed } from "../util/formatters/signed.js"

/**
 * Embed to show changes in teamwork helpers
 *
 * Shows helper mentions along with their added dice and a symbol based on their current status. Helpers who
 * were not requested but have contributed dice get a plus symbol. Helpers who were requested and have
 * contributed get a green check. Helpers who were requested but have *not* contributed dice get a red x.
 */
export class TeamworkChangeEmbed {
  test
  t
  teamwork_db
  builder
  _helpers

  /**
   * Create a new teamwork changed embed
   * @param  {TeamworkTest}        test Teamwork test object
   * @return {TeamworkChangeEmbed}      Embed object
   */
  constructor(test) {
    this.builder = new EmbedBuilder()
    this.test = test
    this.teamwork_db = new Teamwork()
    this.t = i18n.getFixedT(test.locale, "teamwork", "embeds.change")

    this.builder.setColor(0x03b199)
    this.builder.setTitle(this.t("title"))
    this.builder.setDescription(this.description)
    this.builder.addFields(this.helper_names, this.helper_bonuses)
  }

  /**
   * The description text of the embed.
   * @type string
   */
  get description() {
    const desc_args = {
      leader: userMention(this.test.leader),
      description: this.test.description,
      context: this.test.description ? "description" : undefined,
    }

    return this.t("body", desc_args)
  }

  /**
   * Helper objects for the test
   * @type {Helper[]}
   */
  get helpers() {
    if (!this._helpers) {
      this._helpers = this.teamwork_db.allHelpers(this.test.id).filter((helper) => helper.user_uid !== this.test.leader)
    }
    return this._helpers
  }

  /**
   * Helper name field object
   * @type object
   */
  get helper_names() {
    const names = this.helpers.map((h) => this.annotateHelper(h))
    return {
      name: this.t("fields.helper-name.title"),
      inline: true,
      value: names.join("\n"),
    }
  }

  /**
   * Helper bonuses field object
   * @return object
   */
  get helper_bonuses() {
    const bonuses = this.helpers.map((helper) => {
      if (helper.dice === null) return "—"
      return signed(helper.dice)
    })

    return {
      name: this.t("fields.helper-name.title"),
      inline: true,
      value: bonuses.join("\n"),
    }
  }

  /**
   * Annotate a helper's name with the correct symbols
   *
   * Requested helpers with a roll get a check mark. Requested helpers with no roll get a red X. Non-requested
   * helpers are shown with no icon.
   *
   * @param  {Helper} helper Helper to annotate
   * @return {string}        Annotated helper name text
   */
  annotateHelper(helper) {
    const t_args = {
      mention: userMention(helper.user_uid),
    }
    if (helper.requested) {
      if (helper.dice !== null) t_args.context = "present"
      else t_args.context = "missing"
    } else {
      t_args.context = "normal"
    }
    return this.t("helper", t_args)
  }

  /**
   * Get the Discord data object for this embed
   * @return {EmbedBuilder} Builder object
   */
  data() {
    return this.builder
  }
}
