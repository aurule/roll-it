jest.mock("../util/message-builders")

const Joi = require("joi")

const { Interaction } = require("../../testing/interaction")
const { Opposed } = require("../db/opposed")
const { Challenge } = require("../db/opposed/challenge")
const cancel_button = require("./opposed/cancel-button")
const { UnauthorizedError } = require("../errors/unauthorized-error")
const { ChallengeFixture } = require("../../testing/challenge-fixture")

const opposed_handler = require("./opposed")

const opposed_component_schema = Joi.object({
  name: Joi.string().required(),
  valid_states: Joi.array()
    .required()
    .min(1)
    .items(Joi.string().valid(...Object.values(Challenge.States))),
  data: Joi.function().required(),
  execute: Joi.function().required().arity(1),
}).unknown()

describe("opposed component correctness", () => {
  it.concurrent.each(Array.from(opposed_handler.components.entries()))(
    "`%s` component matches the schema",
    (_name, component) => {
      expect(component).toMatchSchema(opposed_component_schema)
    },
  )
})

describe("opposed component handler", () => {
  describe("santize_id", () => {
    it("removes trailing ids", () => {
      const id = "test_component_5"

      const result = opposed_handler.sanitize_id(id)

      expect(result).toEqual("test_component")
    })
  })

  describe("canHandle", () => {
    it("returns true when customId matches an opposed component", () => {
      const result = opposed_handler.canHandle({ customId: "opposed_cancel" })

      expect(result).toBe(true)
    })

    it("returns true when sanitizedcustomId matches an opposed component", () => {
      const result = opposed_handler.canHandle({ customId: "opposed_cancel_5" })

      expect(result).toBe(true)
    })

    it("returns false when customId does not match an opposed component", () => {
      const result = opposed_handler.canHandle({ customId: "nope" })

      expect(result).toBe(false)
    })
  })

  describe("handle", () => {
    let interaction

    describe("with no challenge record for the message", () => {
      it("replies that the challenge is over", async () => {
        interaction = new Interaction()

        await opposed_handler.handle(interaction)

        expect(interaction.replyContent).toMatch("has concluded")
      })
    })

    describe("with a challenge in a final state", () => {
      it.concurrent.each([...Challenge.FinalStates])(
        "%s: replies that the challenge is over",
        async (state) => {
          const interaction = new Interaction()
          new ChallengeFixture(state).attachMessage(interaction.message.id)

          await opposed_handler.handle(interaction)

          expect(interaction.replyContent).toMatch("has concluded")
        },
      )
    })

    describe("with a challenge in a non-final state, but past its timeout", () => {
      let challenge

      beforeEach(() => {
        interaction = new Interaction()
        interaction.customId = "opposed_cancel"

        challenge = new ChallengeFixture()
          .withParticipants()
          .expire()
          .attachMessage(interaction.message.id)
      })

      afterEach(() => {
        challenge.cleanup()
      })

      it("replies that the challenge is over", async () => {
        await opposed_handler.handle(interaction)

        expect(interaction.replyContent).toMatch("has concluded")
      })
    })

    describe("with a valid challenge, but for a finished test record", () => {
      let challenge
      let opposed_db

      beforeEach(() => {
        interaction = new Interaction()
        interaction.customId = "opposed_cancel"

        opposed_db = new Opposed()
        challenge = new ChallengeFixture(Challenge.States.Cancelling).withParticipants()
        challenge
          .defenderRetest("ability")
          .cancelWith("ability")
          .attachMessage(interaction.message.id)
        interaction.user.id = challenge.attacker.uid

        opposed_db.addFutureTest({
          challenge_id: challenge.id,
          locale: "en-US",
          leader_id: challenge.attacker.id,
        })
      })

      it("replies that the message is outdated", async () => {
        await opposed_handler.handle(interaction)

        expect(interaction.replyContent).toMatch("message is outdated")
      })
    })

    describe("with a challenge in the wrong state", () => {
      let challenge

      beforeEach(() => {
        interaction = new Interaction()
        interaction.customId = "opposed_cancel"

        challenge = new ChallengeFixture(Challenge.States.Winning).withParticipants()
        challenge
          .defenderRetest("ability")
          .cancelWith("ability")
          .attachMessage(interaction.message.id)
        interaction.user.id = challenge.attacker.uid
      })

      it("replies that the message is outdated", async () => {
        await opposed_handler.handle(interaction)

        expect(interaction.replyContent).toMatch("message is outdated")
      })
    })

    describe("with a valid, current challenge", () => {
      let execute_spy

      beforeEach(() => {
        interaction = new Interaction()
        interaction.customId = "opposed_cancel"

        challenge = new ChallengeFixture(Challenge.States.Cancelling).withParticipants()
        challenge.addTest().attachMessage(interaction.message.id)

        execute_spy = jest.spyOn(cancel_button, "execute")
      })

      it("lets the component handle the interaction", async () => {
        execute_spy.mockImplementation(async () => true)

        await opposed_handler.handle(interaction)

        expect(execute_spy).toHaveBeenCalled()
      })

      it("replies with an error message when user is unauthorized", async () => {
        execute_spy.mockImplementation(async () => {
          throw new UnauthorizedError(interaction, [interaction.user.id])
        })

        await opposed_handler.handle(interaction)

        expect(interaction.replyContent).toMatch("can use this control")
      })
    })
  })
})
