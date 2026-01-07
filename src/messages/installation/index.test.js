const Joi = require("joi")

const messages = require("./index")

const message_schema = Joi.object({
  name: Joi.string().required(),
  data: Joi.function().arity(1).required(),
  inert: Joi.function().optional(),
  afterRetry: Joi.function().arity(1).optional(),
  handleReply: Joi.function().arity(1).optional(),
}).unknown()

describe("installation messages", () => {
  it("loads message files", () => {
    expect(messages.size).toBeGreaterThan(0)
  })

  it("indexes messages by name", () => {
    expect(messages.get("starting").name).toEqual("starting")
  })

  it("excludes the index file", () => {
    expect(messages.has(undefined)).toBeFalsy()
  })

  it.concurrent.each(
    messages.map((m) => [m.state, m]),
  )("%s message matches schema", (_state, message) => {
    expect(message).toMatchSchema(message_schema)
  })
})
