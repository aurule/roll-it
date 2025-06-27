const { Interaction } = require("../../testing/interaction")
const { Opposed } = require("../db/opposed")
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
      const result = opposed_handler.canHandle({customId: "opposed_cancel"})

      expect(result).toBe(true)
    })

    it("returns true when sanitizedcustomId matches an opposed component", () => {
      const result = opposed_handler.canHandle({customId: "opposed_cancel_5"})

      expect(result).toBe(true)
    })

    it("returns false when customId does not match an opposed component", () => {
      const result = opposed_handler.canHandle({customId: "nope"})

      expect(result).toBe(false)
    })
  })

  describe("handle", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    describe("with no challenge record for the message", () => {
      it.todo("replies that the challenge is over")
    })

    describe("with expired challenge", () => {
      it.todo("replies that the challenge is over")
    })

    describe("with an older test", () => {
      it.todo("replies that the message is outdated")
    })

    describe("with a valid, current test", () => {
      it.skip("lets the component handle the interaction", async () => {
        execute_spy.mockImplementation(() => true)

        await teamwork.handle(interaction)

        expect(execute_spy).toHaveBeenCalled()
      })

      it.skip("replies with an error message when user is unauthorized", async () => {
        execute_spy.mockImplementation(() => {throw new UnauthorizedError(interaction, [interaction.user.id])})

        await teamwork.handle(interaction)

        expect(interaction.replyContent).toMatch("can use this control")
      })
    })
  })
})
