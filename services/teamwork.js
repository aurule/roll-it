const {
  Collection,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType
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
  async handleTeamwork({
    interaction,
    userFlake,
    description,
    initialPool,
    roller,
    summer,
    presenter,
  }) {
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
      components: [buttons_row],
      ephemeral: true,
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
      ComponentType: ComponentType.StringSelect,
      time: timeout_ms,
    })
    bonus_collector.on('collect', event => {
      event.deferUpdate()
      helper_selections.set(event.user.id, event.values)
    })

    return leader_prompt.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: timeout_ms,
    })
      .then(event => {
        event.deferUpdate()
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
          content: teamworkPresenter.teamworkSummaryMessage(leader_summary),
          embeds: [helper_embed],
          fetchReply: true
        })
          .then(result_message => {

            helper_prompt.edit({
              content: teamworkPresenter.helperRolledMessage(userFlake, description, result_message),
              components: [],
            })
          })
      })
      .catch(err => {
        bonus_collector.stop()
        leader_prompt.delete()
        helper_prompt.edit({
          content: teamworkPresenter.helperTimeoutMessage(userFlake, description),
          components: [],
        })
      })
  }
}
