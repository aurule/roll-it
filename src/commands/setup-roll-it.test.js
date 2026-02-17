import { Interaction } from "../../testing/interaction.js"
import { Installation } from "../db/installation.js"

vitest.mock("../util/message-builders")
vitest.mock("../services/api")

import { SetupRollIt } from "./setup-roll-it.js"

describe("/setup-roll-it command", () => {
  afterEach(() => {
    vitest.clearAllMocks()
  })

  it("is global", () => {
    expect(SetupRollIt.global).toBe(true)
  })

  describe("execute", () => {
    let interaction
    let install_db

    beforeEach(() => {
      interaction = new Interaction()
      install_db = new Installation()
    })

    it("creates an installation record", async () => {
      const setup_command = new SetupRollIt(interaction)

      await setup_command.execute()

      expect(install_db.installationCount()).toEqual(1)
    })

    it("shows the starting message", async () => {
      const setup_command = new SetupRollIt(interaction)

      await setup_command.execute()

      expect(interaction.replyContent).toMatch("installed on this server")
    })
  })
})
