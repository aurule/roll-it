const Joi = require("joi")
const { Challenge } = require("../../db/opposed/challenge")

const messages = require("./index")

const message_schema = Joi.object({
  state: Joi.string()
    .required()
    .valid(...Object.values(Challenge.States)),
  data: Joi.function().arity(1).required(),
  inert: Joi.function().arity(1).optional(),
  afterRetry: Joi.function().arity(1).optional(),
  handleReply: Joi.function().arity(1).optional(),
})

describe("opposed messages", () => {
  it("loads message files", () => {
    expect(messages.size).toBeGreaterThan(0)
  })

  it("indexes messages by state name", () => {
    expect(messages.get("withdrawn").state).toEqual("withdrawn")
  })

  it("excludes the index file", () => {
    expect(messages.has(undefined)).toBeFalsy()
  })

  it.concurrent.each(messages.map((m) => [m.state, m]))(
    "%s message matches schema",
    (_state, message) => {
      expect(message).toMatchSchema(message_schema)
    },
  )
})
