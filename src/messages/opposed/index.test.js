const Joi = require("joi")
import { Challenge } from "../../db/opposed/challenge.js"

const messages = require("./index")

const message_schema = Joi.object({
  challengeState: Joi.string()
    .required()
    .valid(...Object.values(Challenge.States)),
  messageData: Joi.function().arity(1).required(),
  inert: Joi.function().optional(),
  afterRetry: Joi.function().arity(1).optional(),
  onReply: Joi.function().arity(1).optional(),
})

describe("opposed messages", () => {
  it("loads message files", () => {
    expect(messages.size).toBeGreaterThan(0)
  })

  it("indexes messages by state name", () => {
    expect(messages.get("withdrawn").challengeState).toEqual("withdrawn")
  })

  it("excludes the index file", () => {
    expect(messages.has(undefined)).toBeFalsy()
  })

  it.concurrent.each(
    messages.map((m) => [m.challengeState, m]),
  )("%s message matches schema", (_state, message) => {
    expect(message).toMatchSchema(message_schema)
  })
})
