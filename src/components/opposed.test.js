jest.mock("../util/message-builders")

const { Interaction } = require("../../testing/interaction")
const { Opposed } = require("../db/opposed")
const { Challenge } = require("../db/opposed/challenge")
const { OpTest } = require("../db/opposed/optest")
const { Participant } = require("../db/opposed/participant")
const cancel_button = require("./opposed/cancel-button")
const { UnauthorizedError } = require("../errors/unauthorized-error")

const opposed_handler = require("./opposed")

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
      it.concurrent.each([
        ...Challenge.FinalStates,
      ])("%s: replies that the challenge is over", async (state) => {
        const interaction = new Interaction()
        const opposed_db = new Opposed()
        let challenge_id = opposed_db.addChallenge({
          locale: "en-US",
          description: "testing challenge",
          attacker_uid: "atk",
          attribute: "mental",
          retest_ability: "occult",
          state: Challenge.States.Conceded,
          channel_uid: "testchan",
          timeout: 1000,
        }).lastInsertRowid
        opposed_db.addMessage({
          message_uid: interaction.message.id,
          challenge_id,
        })

        await opposed_handler.handle(interaction)

        expect(interaction.replyContent).toMatch("has concluded")
      })
    })

    describe("with a challenge in a non-final state, but past its timeout", () => {
      let opposed_db
      let challenge_id
      const attacker_uid = "atk"
      const defender_uid = "def"

      beforeEach(() => {
        interaction = new Interaction()
        interaction.customId = "opposed_cancel"

        opposed_db = new Opposed()
        challenge_id = opposed_db.addChallenge({
          locale: "en-US",
          description: "testing challenge",
          attacker_uid,
          attribute: "mental",
          retest_ability: "occult",
          state: Challenge.States.AdvantagesAttacker,
          channel_uid: "testchan",
          timeout: -1000,
        }).lastInsertRowid
        opposed_db.addMessage({
          message_uid: interaction.message.id,
          challenge_id,
        })

        opposed_db.addParticipant({
          challenge_id,
          user_uid: attacker_uid,
          mention: `<@${attacker_uid}>`,
          role: Participant.Roles.Attacker,
          advantages: ["hi", "there"],
        })
        opposed_db.addParticipant({
          challenge_id,
          user_uid: defender_uid,
          mention: `<@${defender_uid}>`,
          role: Participant.Roles.Defender,
          advantages: ["oh", "no"],
        })
      })

      it("replies that the challenge is over", async () => {
        await opposed_handler.handle(interaction)

        expect(interaction.replyContent).toMatch("has concluded")
      })
    })

    describe("with a valid challenge, but for a finished test record", () => {
      let opposed_db
      const attacker_uid = "atk"

      beforeEach(() => {
        interaction = new Interaction()
        interaction.customId = "opposed_cancel"

        opposed_db = new Opposed()
        let challenge_id = opposed_db.addChallenge({
          locale: "en-US",
          description: "testing challenge",
          attacker_uid,
          attribute: "mental",
          retest_ability: "occult",
          state: Challenge.States.Winning,
          channel_uid: "testchan",
          timeout: 1000,
        }).lastInsertRowid

        let attacker_id = opposed_db.addParticipant({
          challenge_id,
          user_uid: attacker_uid,
          mention: `<@${attacker_uid}>`,
          role: Participant.Roles.Attacker,
          advantages: ["hi", "there"],
        }).lastInsertRowid
        let defender_id = opposed_db.addParticipant({
          challenge_id,
          user_uid: interaction.user.id,
          mention: `<@${interaction.user.id}>`,
          role: Participant.Roles.Defender,
          advantages: ["oh", "no"],
        }).lastInsertRowid

        let test_id = opposed_db.addTest({
          challenge_id,
          locale: "en-US",
          leader_id: attacker_id,
          retester_id: attacker_id,
          retest_reason: OpTest.RetestReasons.Ability,
          canceller_id: defender_id,
          cancelled_with: OpTest.CancelReasons.Ability,
        }).lastInsertRowid

        opposed_db.addMessage({
          message_uid: interaction.message.id,
          challenge_id,
          test_id,
        })

        opposed_db.addFutureTest({
          challenge_id,
          locale: "en-US",
          leader_id: attacker_id,
        })
      })

      it("replies that the challenge is over", async () => {
        await opposed_handler.handle(interaction)

        expect(interaction.replyContent).toMatch("message is outdated")
      })
    })

    describe("with a valid, current challenge", () => {
      let opposed_db
      let execute_spy
      const attacker_uid = "atk"

      beforeEach(() => {
        interaction = new Interaction()
        interaction.customId = "opposed_cancel"

        opposed_db = new Opposed()
        let challenge_id = opposed_db.addChallenge({
          locale: "en-US",
          description: "testing challenge",
          attacker_uid,
          attribute: "mental",
          retest_ability: "occult",
          state: Challenge.States.Winning,
          channel_uid: "testchan",
          timeout: 1000,
        }).lastInsertRowid

        let attacker_id = opposed_db.addParticipant({
          challenge_id,
          user_uid: attacker_uid,
          mention: `<@${attacker_uid}>`,
          role: Participant.Roles.Attacker,
          advantages: ["hi", "there"],
        }).lastInsertRowid
        let defender_id = opposed_db.addParticipant({
          challenge_id,
          user_uid: interaction.user.id,
          mention: `<@${interaction.user.id}>`,
          role: Participant.Roles.Defender,
          advantages: ["oh", "no"],
        }).lastInsertRowid

        let test_id = opposed_db.addTest({
          challenge_id,
          locale: "en-US",
          leader_id: attacker_id,
          retester_id: attacker_id,
          retest_reason: OpTest.RetestReasons.Ability,
          canceller_id: defender_id,
          cancelled_with: OpTest.CancelReasons.Ability,
        }).lastInsertRowid

        opposed_db.addMessage({
          message_uid: interaction.message.id,
          challenge_id,
          test_id,
        })

        execute_spy = jest.spyOn(cancel_button, "execute")
      })

      it("lets the component handle the interaction", async () => {
        execute_spy.mockImplementation(() => true)

        await opposed_handler.handle(interaction)

        expect(execute_spy).toHaveBeenCalled()
      })

      it("replies with an error message when user is unauthorized", async () => {
        execute_spy.mockImplementation(() => {
          throw new UnauthorizedError(interaction, [interaction.user.id])
        })

        await opposed_handler.handle(interaction)

        expect(interaction.replyContent).toMatch("can use this control")
      })
    })
  })
})
