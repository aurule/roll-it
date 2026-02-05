import { opposedBegin } from "../../interactive/opposed.js"
import { descriptionOption } from "../../util/common-options.js"
import { Child } from "../abstract/child-command.js"
import { Command } from "../abstract/command.js"

/**
 * Base class for the met opposed command
 */
class OpposedBase extends Command {
  static name = "opposed"

  attacker
  defender
  attribute = ""
  retest = ""
  description = ""

  static data() {
    return this.builder
      .addLocalizedUserOption("opponent", (option) => option.setRequired(true))
      .addLocalizedStringOption("attribute", (option) =>
        option.setLocalizedChoices("mental", "social", "physical").setRequired(true),
      )
      .addLocalizedStringOption("retest", (option) => option.setRequired(true))
      .addStringOption(descriptionOption)
  }

  constructor(interaction) {
    super(interaction)

    this.saveOption("attribute")
    this.saveOption("description")
    this.saveOption("retest")
    this.attacker = this.interaction.user.id
    this.defender = this.interaction.options.getUser("opponent").id
  }

  perform() {
    return opposedBegin({
      interaction,
      attackerId: this.attacker,
      defenderId: this.defender,
      attribute: this.attribute,
      retest: this.retest,
      description: this.description,
    })
  }

  validate() {
    if (this.attacker === this.defender) return this.t("options.opponent.validation.self")
  }
}
