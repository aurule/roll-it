import embedField from "../../testing/discord-schemas/embed-field.js"
import { Teamwork } from "../db/teamwork.js"

import { TeamworkSummaryEmbed } from "./teamwork-summary.js"

describe("TeamworkSummaryEmbed class", () => {
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
      const embed = new TeamworkSummaryEmbed(teamwork_test)

      expect(embed.description).toMatch("@cap")
    })

    it("includes the test's own description if present", () => {
      const embed = new TeamworkSummaryEmbed(teamwork_test)

      expect(embed.description).toMatch("test test")
    })
  })

  describe("leader", () => {
    it("gets the leader's record", () => {
      const embed = new TeamworkSummaryEmbed(teamwork_test)

      const record = embed.leader

      expect(record.user_uid).toEqual("cap")
    })
  })

  describe("leader_info", () => {
    it("returns a valid embed field", () => {
      const embed = new TeamworkSummaryEmbed(teamwork_test)

      expect(embed.leader_info).toMatchSchema(embedField)
    })
  })

  describe("helpers", () => {
    beforeEach(() => {
      db.setRequestedHelpers(teamwork_test.id, ["helper1"])
      db.setDice(teamwork_test.id, "helper1", 1)
      db.addHelper({
        teamwork_id: teamwork_test.id,
        userId: "helper2",
        dice: 3,
      })
      db.setRequestedHelpers(teamwork_test.id, ["helper3"])
    })

    it("excludes the leader", () => {
      const embed = new TeamworkSummaryEmbed(teamwork_test)

      const helpers = embed.helpers

      const ids = helpers.map(h => h.user_uid)
      expect(ids).not.toContain("cap")
    })

    it("includes requested helpers with dice", () => {
      const embed = new TeamworkSummaryEmbed(teamwork_test)

      const helpers = embed.helpers

      const ids = helpers.map(h => h.user_uid)
      expect(ids).toContain("helper1")
    })

    it("includes non-requested helpers with dice", () => {
      const embed = new TeamworkSummaryEmbed(teamwork_test)

      const helpers = embed.helpers

      const ids = helpers.map(h => h.user_uid)
      expect(ids).toContain("helper2")
    })

    it("does not show requested helpers with no data", () => {
      const embed = new TeamworkSummaryEmbed(teamwork_test)

      const helpers = embed.helpers

      const ids = helpers.map(h => h.user_uid)
      expect(ids).not.toContain("helper3")
    })
  })

  describe("helper_names", () => {
    it("returns a valid embed field", () => {
      db.addHelper({
        teamwork_id: teamwork_test.id,
        userId: "helper2",
        dice: 3,
      })

      const embed = new TeamworkSummaryEmbed(teamwork_test)

      expect(embed.helper_names).toMatchSchema(embedField)
    })
  })

  describe("helper_bonuses", () => {
    it("shows plus sign for positive dice", () => {
      db.addHelper({
        teamwork_id: teamwork_test.id,
        userId: "helper2",
        dice: 3,
      })
      const embed = new TeamworkSummaryEmbed(teamwork_test)

      const bonuses = embed.helper_bonuses

      expect(bonuses.value).toMatch("+3")
    })

    it("shows negative sign for negative dice", () => {
      db.addHelper({
        teamwork_id: teamwork_test.id,
        userId: "helper2",
        dice: -2,
      })
      const embed = new TeamworkSummaryEmbed(teamwork_test)

      const bonuses = embed.helper_bonuses

      expect(bonuses.value).toMatch("-2")
    })

    it("returns a valid embed field", () => {
      db.addHelper({
        teamwork_id: teamwork_test.id,
        userId: "helper2",
        dice: -2,
      })

      const embed = new TeamworkSummaryEmbed(teamwork_test)

      expect(embed.helper_bonuses).toMatchSchema(embedField)
    })
  })
})
