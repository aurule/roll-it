/**
 * Shared teamwork handler
 *
 * This handler is made to be called from within a command. The command must supply the required callbacks to
 * actually do the rolling, as this handler only cares about the teamwork logic itself.
 *
 * See util/teamwork-settings for the helper options and timeout value.
 */

const {
  Collection,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  UserSelectMenuBuilder
} = require('discord.js');
const teamworkPresenter = require("../presenters/teamwork-presenter")
const { bonusOptions, timeout_ms } = require("../util/teamwork-settings")

function increasePool(initial_pool, bonuses) {
  let final_pool = bonuses.reduce(
    (acc, curr) => acc + curr,
    initial_pool,
  )
  return final_pool
}

function makeLeaderResults(final_pool, roller, summer, presenter) {
  const raw_results = roller(final_pool)
  const summed_results = summer(raw_results)
  const presented_roll = presenter(final_pool, raw_results, summed_results)
  return presented_roll
}

function bonusesFromSelections(selections) {
  return selections.mapValues(v => v.reduce((a, n) => a + (+n), 0))
}

module.exports = {
  increasePool,
  makeLeaderResults,
  bonusesFromSelections,

  /**
   * Handle teamwork roll logic
   *
   * This is the main entry point for teamwork rolls. It expects to be given appropriate callback functions
   * for rolling dice, summing their results, and presenting those summed results. Otherwise, it handles the
   * various prompts and interactions required to collect helper rolls, create a final pool, and display
   * the final results.
   *
   * @param  {Interaction} opts.interaction       The command interaction that the user triggered
   * @param  {Snowflake} opts.userFlake           Unique snowflake ID of the leading user
   * @param  {string} opts.description            Description for the roll. Optional.
   * @param  {int} opts.initialPool               The base number of dice in the pool. This should be the
   *                                              leader's dice pool.
   * @param  {fn(int)} opts.roller                Dice roller callback.
   * @param  {fn(Array<int>[])} opts.summer       Roll summation callback.
   * @param  {Fn(int, Array<int>[], int[])} opts.presenter        Roll presenter callback.
   *
   * @return {Promise}                            Promise resolving to a message component interaction
   */
  async handleTeamwork({
    interaction,
    userFlake,
    description,
    initialPool,
    roller,
    summer,
    presenter,
  }) {
    const user_menu = new UserSelectMenuBuilder()
      .setCustomId("helpers")
      .setPlaceholder("Request help from these users")
      .setMaxValues(25)
    const user_row = new ActionRowBuilder()
      .addComponents(user_menu)
    const go_button = new ButtonBuilder()
      .setCustomId("go_button")
      .setLabel("Roll It!")
      .setStyle(ButtonStyle.Primary)
    const cancel_button = new ButtonBuilder()
      .setCustomId("cancel_button")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary)
    const buttons_row = new ActionRowBuilder()
      .addComponents(go_button, cancel_button)
    const leader_prompt = await interaction.reply({
      content: teamworkPresenter.leaderPromptMessage(userFlake),
      components: [user_row, buttons_row],
      ephemeral: true,
    })

    const requested_collector = leader_prompt.createMessageComponentCollector({
      componentType: ComponentType.UserSelect,
      time: timeout_ms,
    })
    requested_collector.on('collect', event => {
      event.deferUpdate()
      // get ids to ping based on event.values, store it
      // create or update notification message, like teamworkPresenter.notifyRequested(event.values)
      // update red/green marks on requested helpers
    })

    const bonus_selector = new StringSelectMenuBuilder()
      .setCustomId("bonus_selector")
      .setPlaceholder("Select your bonus")
      .setMinValues(1)
      .setMaxValues(11)
      .addOptions(...bonusOptions)
    const picker_row = new ActionRowBuilder()
      .addComponents(bonus_selector)
    const helper_prompt = await interaction.followUp({
      content: teamworkPresenter.helperPromptMessage(userFlake, description),
      components: [picker_row],
      fetchReply: true,
    })

    const helper_selections = new Collection()

    const bonus_collector = helper_prompt.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: timeout_ms,
    })
    bonus_collector.on('collect', event => {
      event.deferUpdate()
      helper_selections.set(event.user.id, event.values)
      // update red/green marks
      // update contributors list on the helper message
    })

    const rollHandler = (event) => {
      bonus_collector.stop()
      leader_prompt.delete()

      if (event.customId == 'cancel_button') {
        helper_prompt.edit({
          content: teamworkPresenter.helperCancelledMessage(userFlake, description),
          components: [],
        })
        return
      }

      const bonuses = bonusesFromSelections(helper_selections)
      const final_pool = increasePool(initialPool, bonuses)
      const leader_summary = makeLeaderResults(final_pool, roller, summer, presenter)
      const helper_embed = teamworkPresenter.contributorEmbed(userFlake, initialPool, bonuses)

      interaction.followUp({
        content: teamworkPresenter.teamworkSummaryMessage(leader_summary, helper_prompt),
        embeds: [helper_embed],
        fetchReply: true
      })
        .then(result_message => {

          helper_prompt.edit({
            content: teamworkPresenter.helperRolledMessage(userFlake, description, result_message),
            components: [],
          })
        })
    }

    return leader_prompt.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: timeout_ms,
    })
      .then(event => {
        event.deferUpdate()
        return rollHandler(event)
      },
      rollHandler)
  }
}
