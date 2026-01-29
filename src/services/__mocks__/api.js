/**
 * API overrides for testing
 */

export const sendMessage = jest.fn(async (channelId, payload) => {
  return {
    channel_id: channelId,
    payload: payload,
    detail: `sent message to channel ${channelId}`,
  }
})

export const getGuildCommands = jest.fn(async (_guildId) => [])

export const setGuildCommands = jest.fn(async (_guildId, _commandNames) => true)
