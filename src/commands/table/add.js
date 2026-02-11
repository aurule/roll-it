import { userMention } from "discord.js"
import Joi from "joi"

import { GuildRollables } from "../../db/rollable.js"
import { fetchLines } from "../../util/attachment-lines.js"
import { Command } from "../abstract/command.js"
import { Child } from "../abstract/child-command.js"
import { secretOption } from "../../util/common-options.js"

/**
 * Max size of an uploaded file, in bytes
 * @type number
 */
export const MAX_UPLOAD_SIZE = 5_242_880

/**
 * Max number of lines in a file
 * @type number
 */
export const MAX_ENTRY_LENGTH = 1500

/**
 * Schema for validating the uploaded file's contents
 *
 * It ensures that each line is under 1500 characters long and that there are at least two lines.
 *
 * @type {Joi.array}
 */
export const fileContentSchema = Joi.array()
  .items(
    Joi.string()
      .max(MAX_ENTRY_LENGTH)
      .message("options.file.validation.entry.length")
      .trim(),
  )
  .min(2)
  .message("options.file.validation.lines.min")
  .required()

/**
 * Base class for the saved add command
 */
class AddBase extends Command {
  static name = "add"

  name = ""
  description = ""
  file
  table_db
  contents

  static data() {
    return this.builder
      .addLocalizedStringOption("name", (option) => option.setMinLength(3).setRequired(true))
      .addLocalizedStringOption("description", (option) => option.setMinLength(3).setRequired(true))
      .addLocalizedAttachmentOption("file", (option) => option.setRequired(true))
      .addBooleanOption(secretOption)
  }

  constructor(interaction) {
    super(interaction)

    this.saveOption("name")
    this.saveOption("description")
    this.saveOption("file")

    this.table_db = new GuildRollables(interaction.guildId)
  }

  async execute() {
    await this.interaction.deferReply()

    const options_error = this.validate_options()
    if (options_error) {
      return this.interaction.whisper(options_error)
    }

    this.contents = await fetchLines(table_file)

    const contents_error = await this.validate_contents()
    if (contents_error) {
      return this.interaction.whisper(contents_error)
    }

    this.table_db.create(this.name, this.description, this.contents)
    return this.interaction.editReply({
      content: this.t("response.success", { user: userMention(this.interaction.user.id), name: this.name }),
      ephemeral: this.secret,
    })
  }

  validate_options() {
    if (this.table_db.taken(this.name)) return this.t("options.name.taken", { name: this.name })
    if (file.contentType != "text/plain") return this.t("options.file.type", { type: this.file.contentType })
    if (file.size > MAX_UPLOAD_SIZE) return this.t("options.file.size")
  }

  async validate_contents() {
    let validated_contents
    try {
      validated_contents = fileContentSchema.validateAsync(this.contents)
    } catch (err) {
      return this.t(err.details[0].message)
    }
    this.contents = validated_contents
  }

  static help_data(_opts) {
    return {
      entry_length: MAX_ENTRY_LENGTH,
    }
  }
}

/**
 * Class for the saved add command
 */
export const Add = Child(AddBase, "saved")
