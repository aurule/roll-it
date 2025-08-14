jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Interaction } = require("../../../testing/interaction")
const { Challenge } = require("../../db/opposed/challenge")
const { Participant } = require("../../db/opposed/participant")

const throwPicker = require("./throw-picker")

describe("chop request selector", () => {
  describe("data", () => {
    it("customId includes participant id", () => {
      const selector = throwPicker.data("en-US", { id: "atk", advantages: [] })

      expect(selector.data.custom_id).toMatch("atk")
    })

    it("has a descriptive placeholder", () => {
      const selector = throwPicker.data("en-US", { id: "adelade", advantages: [] })

      expect(selector.data.placeholder).toMatch("symbol you want to throw")
    })

    describe("when participant has bomb advantage", () => {
      it.concurrent.each([
        ["rock"],
        ["scissors"],
        ["bomb"],
        ["rand-bomb"],
      ])("includes the %s option", (opt) => {
        const selector = throwPicker.data("en-US", { id: "atk", advantages: ["bomb"] })

        const option_names = selector.options.map((o) => o.data.value)
        expect(option_names).toContain(opt)
      })

      it.concurrent.each([["paper"], ["rand"]])("does not include the %s option", (opt) => {
        const selector = throwPicker.data("en-US", { id: "atk", advantages: ["bomb"] })

        const option_names = selector.options.map((o) => o.data.value)
        expect(option_names).not.toContain(opt)
      })
    })

    describe("when participant does not have bomb advantage", () => {
      it.concurrent.each([
        ["rock"],
        ["scissors"],
        ["paper"],
        ["rand"],
      ])("includes the %s option", (opt) => {
        const selector = throwPicker.data("en-US", { id: "atk", advantages: [] })

        const option_names = selector.options.map((o) => o.data.value)
        expect(option_names).toContain(opt)
      })

      it.concurrent.each([["bomb"], ["rand-bomb"]])("does not include the %s option", (opt) => {
        const selector = throwPicker.data("en-US", { id: "atk", advantages: [] })

        const option_names = selector.options.map((o) => o.data.value)
        expect(option_names).not.toContain(opt)
      })
    })

    it("requires one value", () => {
      const selector = throwPicker.data("en-US", { id: "atk", advantages: [] })

      expect(selector.data.min_values).toEqual(1)
      expect(selector.data.max_values).toEqual(1)
    })
  })

  describe("execute", () => {
    let interaction
    let challenge
    let the_test

    beforeEach(() => {
      interaction = new Interaction()
      challenge = new ChallengeFixture(Challenge.States.Throwing).withParticipants()
      the_test = challenge.addTest().attachMessage(interaction.message.id)
      interaction.user.id = challenge.attacker.id

      const selector = throwPicker.data("en-US", challenge.attacker.record)
      interaction.customId = selector.data.custom_id
      interaction.values = ["rock"]
    })

    describe("authorization", () => {
      it("allows user with matching id", async () => {
        await expect(throwPicker.execute(interaction)).resolves.not.toThrow()
      })

      it("disallows all others", async () => {
        interaction.user.id = "other"

        await expect(throwPicker.execute(interaction)).rejects.toThrow()
      })
    })

    it("saves throw request", async () => {
      await throwPicker.execute(interaction)

      const chops = the_test.db.getChopsForTest(the_test.id)
      expect(chops[0].request).toEqual("rock")
    })
  })
})
