import { EmbedBuilder, userMention } from "discord.js"
const { Teamwork } = require("../db/teamwork")
const { i18n } = require("../locales")
const { signed } = require("../util/formatters/signed")

/**
 * Embed to show a summary for a finished teamwork test
 */
export class TeamworkSummaryEmbed {
  test
  t
  teamwork_db
  builder

  /**
   * Create a new teamwork summary embed
   * @param  {TeamworkTest}        test Teamwork test object
   * @return {TeamworkChangeEmbed}      Embed object
   */
  constructor(test) {
    this.builder = new EmbedBuilder()
    this.test = test
    this.teamwork_db = new Teamwork()
    this.t = i18n.getFixedT(test.locale, "teamwork", "embeds.summary")

    this.builder.setColor(0x03b199)
    this.builder.setTitle(this.t("title"))
    this.builder.setDescription(this.description)
    this.builder.addField(this.leader_info)
    if (this.helpers.length) {
      this.builder.addField(this.helper_names)
      this.builder.addField(this.helper_bonuses)
    }
  }

  /**
   * The description text of the embed.
   * @type string
   */
  get description() {
    const desc_args = {
      leader: userMention(test.leader),
      description: test.description,
      context: test.description ? "description" : undefined,
    }

    return this.t("body", desc_args)
  }

  /**
   * Get the "helper" object for the leading user
   * @type Helper
   */
  get leader() {
    if (!this._leader) {
      this._leader = this.teamwork_db.realHelpers(test.id).filter((helper) => helper.user_uid === this.test.leader)
    }
    return this._leader
  }

  /**
   * Leader name and bonus field object
   * @type object
   */
  get leader_info() {
    return {
      name: t("fields.leader.title"),
      value: t("fields.leader.body", {
        leader: userMention(this.leader.user_uid),
        count: this.leader.dice,
      })
    }
  }

  /**
   * Helper objects for the test
   * @type {Helper[]}
   */
  get helpers() {
    if (!this._helpers) {
      this._helpers = this.teamwork_db.realHelpers(test.id).filter((helper) => helper.user_uid !== this.test.leader)
    }
    return this._helpers
  }

  /**
   * Helper name field object
   * @type object
   */
  get helper_names() {
    const names = this.helpers.map((helper) => userMention(helper.user_uid))
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
   * Get the Discord data object for this embed
   * @return {EmbedBuilder} Builder object
   */
  data() {
    return this.builder
  }
}
