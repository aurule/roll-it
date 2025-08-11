const { Collection } = require("discord.js")
const { i18n } = require("../../locales")

const { makeBreakdown } = require("./breakdown")

describe("opposed result breakdown creator", () => {
  describe("makeBreakdown", () => {
    let chops
    let participants
    let t

    beforeAll(() => {
      t = i18n.getFixedT("en-US", "interactive", "opposed")
    })

    beforeEach(() => {
      participants = new Collection()
      participants.set("attacker", {
        mention: "<@atk>",
        id: 1,
        user_uid: "attacker",
      })
      participants.set("defender", {
        mention: "<@def>",
        id: 2,
        user_uid: "defender",
      })
    })

    describe("with no leader", () => {
      beforeEach(() => {
        chops = [
          {
            result: "rock",
            traits: -1,
            participant_id: 1,
          },
          {
            result: "rock",
            traits: -1,
            participant_id: 2,
          },
        ]
      })

      it("returns the tied message", () => {
        const result = makeBreakdown({
          leader: null,
          chops,
          participants,
          t,
        })

        expect(result).toMatch(":rock: rock *vs* :rock: rock")
      })

      it("shows bids variant if traits are present", () => {
        chops[0].traits = 5
        chops[1].traits = 5

        const result = makeBreakdown({
          leader: null,
          chops,
          participants,
          t,
        })

        expect(result).toMatch("both bid 5")
      })
    })

    describe("with a leader", () => {
      describe("with matching results", () => {
        beforeEach(() => {
          chops = [
            {
              result: "rock",
              traits: -1,
              participant_id: 1,
            },
            {
              result: "rock",
              traits: -1,
              participant_id: 2,
            },
          ]
        })

        it("shows the tied symbols", () => {
          const result = makeBreakdown({
            leader: participants.first(),
            chops,
            participants,
            t,
          })

          expect(result).toMatch(":rock: rock *vs* :rock: rock")
        })

        it("names the leader as winning", () => {
          const result = makeBreakdown({
            leader: participants.first(),
            chops,
            participants,
            t,
          })

          expect(result).toMatch("<@atk> has ties")
        })
      })

      describe("with different results", () => {
        beforeEach(() => {
          chops = [
            {
              result: "rock",
              traits: -1,
              participant_id: 1,
            },
            {
              result: "scissors",
              traits: -1,
              participant_id: 2,
            },
          ]
        })

        it("returns the winner message", () => {
          const result = makeBreakdown({
            leader: participants.first(),
            chops,
            participants,
            t,
          })

          expect(result).toMatch(":rock: rock *vs* <@def>'s :scissors: scissors")
        })
      })
    })
  })
})
