import embedField from "../../testing/discord-schemas/embed-field.js"
import { Teamwork } from "../db/teamwork.js"

import { TeamworkChangeEmbed } from "./teamwork-change.js"

describe("TeamworkChangeEmbed class", () => {
  /**
   * @type Teamwork
   */
  let db
  let teamwork_test

  beforeEach(() => {
    db = new Teamwork()
    const test_id = db.addTeamwork({
      command: "nwod",
      options: {},
      leader: "cap",
      locale: "en-US",
      channelId: "channel",
      description: "test test",
    }).lastInsertRowid
    teamwork_test = db.detail(test_id)
    db.addHelper({
      teamwork_id: test_id,
      userId: "cap",
      dice: 6,
    })
  })

  describe("description", () => {
    it("mentions the leader", () => {
      const embed = new TeamworkChangeEmbed(teamwork_test)

      expect(embed.description).toMatch("@cap")
    })

    it("includes the test's own description if present", () => {
      const embed = new TeamworkChangeEmbed(teamwork_test)

      expect(embed.description).toMatch("test test")
    })
  })

  describe("helpers", () => {
    beforeEach(() => {
      db.setRequestedHelpers(teamwork_test.id, ["helper1"])
      db.addHelper({
        teamwork_id: teamwork_test.id,
        userId: "helper2",
        dice: 3,
      })
    })

    it("does not include the leader", () => {
      const embed = new TeamworkChangeEmbed(teamwork_test)

      const helpers = embed.helpers

      const helper_uids = helpers.map(h => h.user_uid)
      expect(helper_uids).not.toContain("cap")
    })

    it("includes requested helpers", () => {
      const embed = new TeamworkChangeEmbed(teamwork_test)

      const helpers = embed.helpers

      const helper_uids = helpers.map(h => h.user_uid)
      expect(helper_uids).toContain("helper1")
    })

    it("includes non-requested helpers", () => {
      const embed = new TeamworkChangeEmbed(teamwork_test)

      const helpers = embed.helpers

      const helper_uids = helpers.map(h => h.user_uid)
      expect(helper_uids).toContain("helper2")
    })
  })

  describe("helper_names", () => {
    it("returns a valid embed field", () => {
      db.setRequestedHelpers(teamwork_test.id, ["helper1"])

      const embed = new TeamworkChangeEmbed(teamwork_test)

      expect(embed.helper_names).toMatchSchema(embedField)
    })
  })

  describe("helper_bonuses", () => {
    describe("requested helper with no data", () => {
      beforeEach(() => {
        db.setRequestedHelpers(teamwork_test.id, ["helper1"])
      })

      it("shows placeholder", () => {
        const embed = new TeamworkChangeEmbed(teamwork_test)

        const bonuses = embed.helper_bonuses

        expect(bonuses.value).toMatch("—")
      })
    })

    it("shows plus sign for positive dice", () => {
      db.addHelper({
        teamwork_id: teamwork_test.id,
        userId: "helper2",
        dice: 3,
      })
      const embed = new TeamworkChangeEmbed(teamwork_test)

      const bonuses = embed.helper_bonuses

      expect(bonuses.value).toMatch("+3")
    })

    it("shows negative sign for negative dice", () => {
      db.addHelper({
        teamwork_id: teamwork_test.id,
        userId: "helper2",
        dice: -2,
      })
      const embed = new TeamworkChangeEmbed(teamwork_test)

      const bonuses = embed.helper_bonuses

      expect(bonuses.value).toMatch("-2")
    })

    it("returns a valid embed field", () => {
      db.setRequestedHelpers(teamwork_test.id, ["helper1"])
      const embed = new TeamworkChangeEmbed(teamwork_test)

      expect(embed.helper_bonuses).toMatchSchema(embedField)
    })
  })

  describe("annotateHelper", () => {
    let helper

    describe("with a non-requested helper", () => {
      beforeEach(() => {
        helper = {
          user_uid: "helper2",
          requested: false,
          dice: 2,
        }
      })

      it("mentions the user", () => {
        const embed = new TeamworkChangeEmbed(teamwork_test)

        const annotation = embed.annotateHelper(helper)

        expect(annotation).toMatch("@helper2")
      })

      it("has a plus emoji", () => {
        const embed = new TeamworkChangeEmbed(teamwork_test)

        const annotation = embed.annotateHelper(helper)

        expect(annotation).toMatch("➕")
      })
    })

    describe("with a requested helper", () => {
      beforeEach(() => {
        helper = {
          user_uid: "helper1",
          requested: true,
          dice: null,
        }
      })

      it("mentions the user", () => {
        const embed = new TeamworkChangeEmbed(teamwork_test)

        const annotation = embed.annotateHelper(helper)

        expect(annotation).toMatch("@helper1")
      })

      it("no data: has an x emoji", () => {
        const embed = new TeamworkChangeEmbed(teamwork_test)

        const annotation = embed.annotateHelper(helper)

        expect(annotation).toMatch("❌")
      })

      it("positive dice: has a check emoji", () => {
        helper.dice = 3
        const embed = new TeamworkChangeEmbed(teamwork_test)

        const annotation = embed.annotateHelper(helper)

        expect(annotation).toMatch("✅")
      })

      it("negative dice: has a check emoji", () => {
        helper.dice = -2
        const embed = new TeamworkChangeEmbed(teamwork_test)

        const annotation = embed.annotateHelper(helper)

        expect(annotation).toMatch("✅")
      })

      it("zero dice: has a check emoji", () => {
        helper.dice = 0
        const embed = new TeamworkChangeEmbed(teamwork_test)

        const annotation = embed.annotateHelper(helper)

        expect(annotation).toMatch("✅")
      })
    })
  })
})
