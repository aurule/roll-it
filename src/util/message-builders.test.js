const { MessageFlags, ButtonStyle, ComponentType } = require("discord.js")

const build = require("./message-builders")

describe("message builders", () => {
  describe("message", () => {
    it("creates a components v2 message", () => {
      const message = build.message([build.text("asdf")])

      expect(message.flags).toHaveFlag(MessageFlags.IsComponentsV2)
    })

    it("adds other flags", () => {
      const message = build.message([build.text("asdf")], { flags: MessageFlags.Ephemeral })

      expect(message.flags).toHaveFlag(MessageFlags.IsComponentsV2)
      expect(message.flags).toHaveFlag(MessageFlags.Ephemeral)
    })

    it("translates legacy `secret` option", () => {
      const message = build.message([build.text("asdf")], { secret: true })

      expect(message.flags).toHaveFlag(MessageFlags.Ephemeral)
      expect(message.secret).toBeUndefined()
    })

    it("passes along other options", () => {
      const message = build.message([build.text("asdf")], { withResponse: true })

      expect(message.withResponse).toBe(true)
    })
  })

  describe("textMessage", () => {
    it("adds a single text component", () => {
      const message = build.textMessage("asdf")

      expect(message.components[0].data.content).toMatch("asdf")
    })

    it("translates legacy `secret` option", () => {
      const message = build.textMessage("asdf", { secret: true })

      expect(message.flags).toHaveFlag(MessageFlags.Ephemeral)
      expect(message.secret).toBeUndefined()
    })
  })

  describe("text", () => {
    it("creates a text component with the given text", () => {
      const component = build.text("asdf")

      expect(component.data.content).toMatch("asdf")
    })
  })

  describe("section", () => {
    it("creates a section component", () => {
      const component = build.section([])

      expect(component.data.type).toEqual(9)
    })

    it("with array of strings, adds each as a text component", () => {
      const component = build.section(["one", "two"])

      expect(component.components[0].data.content).toEqual("one")
      expect(component.components[1].data.content).toEqual("two")
    })

    it("with one string, adds a single text component", () => {
      const component = build.section("asdf")

      expect(component.components[0].data.content).toEqual("asdf")
    })
  })

  describe("separator", () => {
    it("creates a separator comopnent", () => {
      const component = build.separator()

      expect(component.data.type).toEqual(14)
    })
  })

  describe("actions", () => {
    it("creates an action row component", () => {
      const component = build.actions()

      expect(component.data.type).toEqual(1)
    })

    it("adds a single component", () => {
      const component = build.actions(
        {
          custom_id: "custom id",
          label: "Click me",
          style: ButtonStyle.Primary,
          type: ComponentType.Button,
        },
      )

      expect(component.components[0].custom_id).toMatch("custom")
    })

    it("adds multiple components", () => {
      const component = build.actions(
        {
          custom_id: "custom id",
          label: "Click me",
          style: ButtonStyle.Primary,
          type: ComponentType.Button,
        },
        {
          custom_id: "second id",
          label: "Or me!",
          style: ButtonStyle.Secondary,
          type: ComponentType.Button,
        },
      )

      expect(component.components[1].custom_id).toMatch("second")
    })
  })
})
