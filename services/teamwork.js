const { Collection } = require('discord.js');
const teamworkPresenter = require("../presenters/teamwork-presenter")
const { ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require("discord.js")
const { allowedEmoji, timeout_ms } = require("../util/teamwork-settings")

function increasePool(initial_pool, collected_reactions) {
  let final_pool = collected_reactions.reduce(
    (acc, curr) => acc + (allowedEmoji.indexOf(curr.emoji.name) * (curr.count - 1)),
    initial_pool,
  )
  if (!final_pool) {
    final_pool = initial_pool
  }
  return {collected_reactions, final_pool}
}

function makeLeaderResults(final_pool, roller, summer, presenter) {
  const raw_results = roller(final_pool)
  const summed_results = summer(raw_results)
  const presented_roll = presenter(final_pool, raw_results, summed_results)
  return presented_roll
}

function reactionFilter(reaction, user) {
  return user.id != process.env.CLIENT_ID && allowedEmoji.includes(reaction.emoji.name)
}

function buttonFilter(interaction, userFlake) {
  interaction.deferUpdate()
  return interaction.user.id == userFlake
}

function seedReactions(message) {
  for (emoji of allowedEmoji) {
    message.react(emoji).catch(err => console.log(err))
  }
}

module.exports = {
  allowedEmoji,
  increasePool,
  makeLeaderResults,
  reactionFilter,
  buttonFilter,
  seedReactions,
  async handleTeamwork({
    interaction,
    userFlake,
    description,
    initialPool,
    roller,
    summer,
    presenter,
  }) {
    const assisterPrompt = await interaction.reply({
      content: teamworkPresenter.promptAssisters(userFlake, description),
      fetchReply: true
    })
    const reactionCollector = assisterPrompt.createReactionCollector({
      filter: reactionFilter,
      time: timeout_ms,
    })

    const go_button = new ButtonBuilder()
      .setCustomId("go_teamwork")
      .setLabel("Roll It!")
      .setStyle(ButtonStyle.Primary)
    const button_row = new ActionRowBuilder()
      .addComponents(go_button)
    const leaderPrompt = await interaction.followUp({
      content: teamworkPresenter.showButton(userFlake),
      components: [button_row],
      fetchReply: true,
    })
    leaderPrompt.awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: i => buttonFilter(i, userFlake),
      time: timeout_ms,
    })
      .finally(interaction => {
        reactionCollector.stop()
      })

    reactionPromise = new Promise((resolve, reject) => {
      reactionCollector.once("end", (reactions, reason) => {
        resolve(reactions)
      })
    })
      .then(collected => {
        leaderPrompt.delete()
        return collected
      })
      .then(collected => increasePool(initialPool, collected))
      .then(data => {
        return {
          presented_roll: makeLeaderResults(data.final_pool, roller, summer, presenter),
          collected_reactions: data.collected_reactions
        }
      })
      .then(data => {
        const summaryMessage = interaction
          .followUp({
            content: teamworkPresenter.finalSummary(data.presented_roll, assisterPrompt),
            fetchReply: true,
          })
          .then(summaryMessage => {
            assisterPrompt.edit({
              content: teamworkPresenter.afterAssisters(userFlake, description, summaryMessage)
            })
            return summaryMessage
          })
          .then(summaryMessage => {
            teamworkPresenter.contributorEmbed(userFlake, initialPool, data.collected_reactions)
              .then(embed => summaryMessage.edit({embeds: [embed]}))
            return summaryMessage
          })

        return summaryMessage
      })
      .catch(err => {
        // there was an actual error
        console.log(err)
      })

    seedReactions(assisterPrompt)

    return reactionPromise
  }
}
