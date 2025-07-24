jest.mock("../../util/message-builders")

const { Opposed } = require("../../db/opposed")
const accepted = require("./accepted")

describe("opposed tie accepted message", () => {
  describe("data", () => {
    let challenge_id
    let opposed_db

    beforeEach(() => {
      opposed_db = new Opposed()
      challenge_id = opposed_db.addChallenge({
        locale: "en-US",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: "accepted",
        channel_uid: "chan",
        summary: "challenge summary",
      }).lastInsertRowid
    })

    it("shows the accepted message", () => {
      const result = accepted.data(challenge_id)

      expect(result.content).toMatch("ended in a tie")
    })

    it("includes the challenge summary", () => {
      const result = accepted.data(challenge_id)

      expect(result.content).toMatch("challenge summary")
    })
  })
})
