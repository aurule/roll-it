import { teamworkBegin } from "../../interactive/teamwork.js"
import { SavableCommand } from "./savable-command.js"

/**
 * Base class for rollers which support interactive teamwork
 *
 * So far, all of these commands have also been savable, hence the parent
 * class.
 *
 * This class handles the standard case where teamwork mode is toggled with a
 * boolean command option named "teamwork".
 */
export class TeamworkableCommand extends SavableCommand {
  static teamworkable = true

  /**
   * Whether teamwork mode is active
   *
   * By default, this is set from the "teamwork" command option.
   *
   * @type {boolean}
   */
  teamwork = false

  /**
   * Create a new TeamworkableCommand object
   *
   * This automatically handles the "teamwork" boolean option.
   *
   * @param  {Interaction}         interaction Discord interaction object
   * @param  {CommandOptions}      options     Command options object
   * @return {TeamworkableCommand}             New TeamworkableCommand object
   */
  constructor(interaction, options) {
    super(interaction, options)

    this.saveOption("teamwork")
  }

  /**
   * Main invocation method
   *
   * This usually invokes validate() and then perform(). When this.teamwork is
   * true, this instead triggers the first step of the teamwork process.
   *
   * @return {Promise} Message reply promise
   */
  async execute() {
    const error_message = this.validate()
    if (error_message) {
      return this.interaction.whisper(error_message)
    }

    if (this.teamwork) {
      return teamworkBegin({
        interaction: this.interaction,
        description: this.description,
        command: this.constructor.name,
        options: this.options,
        pool: this.pool,
      })
    }

    const partial_message = this.perform()

    const full_text = injectMention(partial_message, this.interaction.user.id)
    return this.interaction.paginate({
      content: full_text,
      secret: this.secret,
    })
  }

  /**
   * Special perform method for the final roll of a teamwork test
   *
   * This method is sent the final dice pool after all helper contributions.
   * Just like perform(), this should return a string containing the
   * `{{userMention}}` template variable.
   *
   * @param  {number} final_pool Total dice to roll
   * @return {string}            Response string
   */
  performTeamwork(final_pool) {
    throw new Error("The `performTeamwork` method is not implemented")
  }
}
