jest.mock("../util/message-builders")
jest.mock("../services/api")

const { Opposed } = require("../db/opposed")
const { Challenge } = require("../db/opposed/challenge")
const { Participant } = require("../db/opposed/participant")
const { Interaction } = require("../../testing/interaction")
const api = require("../services/api")

const InteractiveOpposed = require("./opposed")

describe("interactive opposed challenge", () => {
  describe("opposedBegin", () => {
    it("creates a challenge record", async () => {
      const interaction = new Interaction()
      const opposed_db = new Opposed()

      await InteractiveOpposed.opposedBegin({
        interaction,
        description: "",
        attackerId: "atk",
        defenderId: "def",
        attribute: "mental",
        retest: "occult",
      })

      const record = opposed_db.findChallengeByMessage(interaction.message.id)
      expect(record).toBeTruthy()
    })

    describe("locale", () => {
      it("uses guild locale if provided", async () => {
        const interaction = new Interaction()
        interaction.guild.locale = "es-ES"
        const opposed_db = new Opposed()

        await InteractiveOpposed.opposedBegin({
          interaction,
          description: "",
          attackerId: "atk",
          defenderId: "def",
          attribute: "mental",
          retest: "occult",
        })

        const record = opposed_db.findChallengeByMessage(interaction.message.id)
        expect(record.locale).toEqual("es-ES")
      })

      it("uses en-US if no guild locale", async () => {
        const interaction = new Interaction()
        const opposed_db = new Opposed()

        await InteractiveOpposed.opposedBegin({
          interaction,
          description: "",
          attackerId: "atk",
          defenderId: "def",
          attribute: "mental",
          retest: "occult",
        })

        const record = opposed_db.findChallengeByMessage(interaction.message.id)
        expect(record.locale).toEqual("en-US")
      })
    })

    it("creates participant records", async () => {
      const interaction = new Interaction()
      const opposed_db = new Opposed()

      await InteractiveOpposed.opposedBegin({
        interaction,
        description: "",
        attackerId: "atk",
        defenderId: "def",
        attribute: "mental",
        retest: "occult",
      })

      const challenge = opposed_db.findChallengeByMessage(interaction.message.id)
      const challenge_and_more = opposed_db.getChallengeWithParticipants(challenge.id)
      expect(challenge_and_more.attacker).toBeTruthy()
      expect(challenge_and_more.defender).toBeTruthy()
    })

    it("shows the attacker advantages prompt", async () => {
      const interaction = new Interaction()

      await InteractiveOpposed.opposedBegin({
        interaction,
        description: "",
        attackerId: "atk",
        defenderId: "def",
        attribute: "mental",
        retest: "occult",
      })

      expect(interaction.replyContent).toMatch("are attacking")
    })
  })

  describe("opposedTimeout", () => {
    let opposed_db
    let challenge_id

    beforeEach(() => {
      opposed_db = new Opposed()
      challenge_id = opposed_db.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid
      opposed_db.addParticipant({
        challenge_id,
        user_uid: "atk",
        mention: "<@atk>",
        role: Participant.Roles.Attacker,
        advantages: ["hi", "there"],
      }).lastInsertRowid
      opposed_db.addParticipant({
        challenge_id,
        user_uid: "def",
        mention: "<@def>",
        role: Participant.Roles.Defender,
        advantages: ["oh", "no"],
      }).lastInsertRowid
    })

    describe("challenge is finished", () => {
      beforeEach(() => {
        opposed_db.setChallengeState(challenge_id, Challenge.States.Accepted)
      })

      it("leaves state unchanged", async () => {
        await InteractiveOpposed.opposedTimeout(challenge_id)

        const challenge = opposed_db.getChallenge(challenge_id)
        expect(challenge.state).toEqual(Challenge.States.Accepted)
      })

      it("does not send a message", async () => {
        await InteractiveOpposed.opposedTimeout(challenge_id)

        expect(api.sendMessage).not.toHaveBeenCalled()
      })
    })

    it("sets challenge to expired state", async () => {
      await InteractiveOpposed.opposedTimeout(challenge_id)

      const challenge = opposed_db.getChallenge(challenge_id)
      expect(challenge.state).toEqual(Challenge.States.Expired)
    })

    it("shows expired message", async () => {
      await InteractiveOpposed.opposedTimeout(challenge_id)

      expect(api.sendMessage).toHaveBeenCalled()
    })
  })
})
