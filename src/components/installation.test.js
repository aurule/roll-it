vitest.mock("../util/message-builders")

import { Interaction } from "../../testing/interaction.js"
import { InstallationFixture } from "../../testing/installation-fixture.js"
import cancelButton from "./installation/cancel-button.js"
import { UnauthorizedError } from "../errors/unauthorized-error.js"
import { handle } from "./installation.js"

describe("installation component handler", () => {
  describe("handle", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    describe("with no installation record for the message", () => {
      it("replies that the install is finished", async () => {
        await handle(interaction)

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
        await handle(interaction)

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
        await handle(interaction)

        expect(interaction.replyContent).toMatch("has finished")
      })
    })

    describe("with an active install", () => {
      let execute_spy
      let install

      beforeEach(() => {
        interaction.customId = "install_cancel"

        install = new InstallationFixture().attachMessage(interaction.message.id)

        execute_spy = vitest.spyOn(cancelButton, "execute")
      })

      afterEach(() => {
        install.cleanup()
      })

      it("lets the component handle the interaction", async () => {
        execute_spy.mockImplementation(async () => true)

        await handle(interaction)

        expect(execute_spy).toHaveBeenCalled()
      })

      it("replies with an error when user is unauthorized", async () => {
        execute_spy.mockImplementation(async () => {
          throw new UnauthorizedError(interaction, [interaction.user.id])
        })

        await handle(interaction)

        expect(interaction.replyContent).toMatch("can use this control")
      })
    })
  })
})
