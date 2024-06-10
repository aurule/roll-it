const { messageLink } = require("./message-link")

const { Message } = require("../testing/message")

var message

beforeEach(() => {
  message = new Message("test")
})

describe("messageLink", () => {
  it("makes guild message link", () => {
    const result = messageLink(message)

    expect(result).toMatch(message.id.toString())
    expect(result).toMatch(message.channelId.toString())
    expect(result).toMatch(message.guildId.toString())
  })

  it("makes dm message link", () => {
    message.guildId = undefined

    const result = messageLink(message)

    expect(result).toMatch(message.id.toString())
    expect(result).toMatch(message.channelId.toString())
  })

  it("shows embed by default", () => {
    const result = messageLink(message)

    expect(result).not.toMatch(/^\<.*\>$/)
  })

  it("can hide the embed", () => {
    const result = messageLink(message, false)

    expect(result).toMatch(/^\<.*\>$/)
  })
})
