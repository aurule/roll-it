module.exports = {
  sendMessage: jest.fn(async (channelId, payload) => {
    return {
      channel_id: channelId,
      payload: payload,
      detail: `sent message to channel ${channelId}`,
    }
  }),
  getGuildCommands: jest.fn(async (_guildId) => []),
  setGuildCommands: jest.fn(async (_guildId, _commandNames) => true),
}
