vitest.mock("../util/message-builders")

import Joi from "joi"

import { Interaction } from "../../testing/interaction.js"
import { InstallationFixture } from "../../testing/installation-fixture.js"
import cancelButton from "./installation/cancel-button.jx"
import { UnauthorizedError } from "../errors/unauthorized-error.js"
import { handle } from "./installation.js"

const install_component_schema = Joi.object({
  name: Joi.string().required(),
  data: Joi.function().required(),
  execute: Joi.function().required().arity(1),
}).unknown()

describe("install component correctness", () => {
  it.concurrent.each(
    Array.from(install_handler.components.entries()),
  )("`%s` component matches the schema", (_name, component) => {
    expect(component).toMatchSchema(install_component_schema)
  })
})

describe("installation component handler", () => {
  describe("canHandle", () => {
    it("returns true when customId matches an installation component", () => {
      const result = install_handler.canHandle({ customId: "install_cancel" })

      expect(result).toBe(true)
    })

    it("returns false when customId does not match an installation component", () => {
      const result = install_handler.canHandle({ customId: "nope" })

      expect(result).toBe(false)
    })
  })

  describe("handle", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    describe("with no installation record for the message", () => {
      it("replies that the install is finished", async () => {
        await install_handler.handle(interaction)

        expect(interaction.replyContent).toMatch("has finished")
      })
    })

    describe("with an install that has expired", () => {
      let install

      beforeEach(() => {
        interaction.customId = "install_cancel"

        install = new InstallationFixture().expire().attachMessage(interaction.message.id)
      })

      afterEach(() => {
        install.cleanup()
      })

      it("replies that the install is finished", async () => {
        await install_handler.handle(interaction)

        expect(interaction.replyContent).toMatch("has finished")
      })
    })

    describe("with an install that is finished", () => {
      let install

      beforeEach(() => {
        interaction.customId = "install_cancel"

        install = new InstallationFixture().finish().attachMessage(interaction.message.id)
      })

      afterEach(() => {
        install.cleanup()
      })

      it("replies that the install is finished", async () => {
        await install_handler.handle(interaction)

        expect(interaction.replyContent).toMatch("has finished")
      })
    })

    describe("with an active install", () => {
      let execute_spy
      let install

      beforeEach(() => {
        interaction.customId = "install_cancel"

        install = new InstallationFixture().attachMessage(interaction.message.id)

        execute_spy = vitest.spyOn(cancel_button, "execute")
      })

      afterEach(() => {
        install.cleanup()
      })

      it("lets the component handle the interaction", async () => {
        execute_spy.mockImplementation(async () => true)

        await install_handler.handle(interaction)

        expect(execute_spy).toHaveBeenCalled()
      })

      it("replies with an error when user is unauthorized", async () => {
        execute_spy.mockImplementation(async () => {
          throw new UnauthorizedError(interaction, [interaction.user.id])
        })

        await install_handler.handle(interaction)

        expect(interaction.replyContent).toMatch("can use this control")
      })
    })
  })
})
