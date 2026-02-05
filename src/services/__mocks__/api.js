/**
 * API overrides for testing
 */

export const sendMessage = vitest.fn(async (channelId, payload) => {
  return {
    channel_id: channelId,
    payload: payload,
    detail: `sent message to channel ${channelId}`,
  }
})

export const getGuildCommands = vitest.fn(async (_guildId) => [])

export const setGuildCommands = vitest.fn(async (_guildId, _commandNames) => true)
