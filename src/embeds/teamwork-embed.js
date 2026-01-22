import { EmbedBuilder } from "discord.js"
import { i18n } from "../locales/index.js"

export class TeamworkEmbed {
  test
  t
  name

  constructor(test) {
    this.test = test
    this.t = i18n.getFixedT(test.locale, "teamwork", `embeds.${this.name}`)
  }

  data() {
    const embed = new EmbedBuilder().setColor(0x03b199).setTitle(t("title")).setDescription(this.description)

    embed.addFields(...this.fields())

    return embed
  }

  get description() {
    return ""
  }

  fields() {
    return []
  }
}
