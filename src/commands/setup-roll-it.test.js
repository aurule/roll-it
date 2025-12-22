const { CommandInteraction } = require("../../testing/command-interaction")
const { Installation } = require("../db/installation")

jest.mock("../util/message-builders")
jest.mock("../services/api")

describe("/setup-roll-it command", () => {
  const setup_command = require("./setup-roll-it")

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("is global", () => {
    expect(setup_command.global).toBeTruthy()
  })

  describe("execute", () => {
    let cmd_interaction
    let install_db

    beforeEach(() => {
      cmd_interaction = new CommandInteraction({ commandName: "setup-roll-it" })
      install_db = new Installation()
    })

    it("creates an installation record", async () => {
      await setup_command.execute(cmd_interaction)

      expect(install_db.installationCount()).toEqual(1)
    })

    it("shows the starting message", async () => {
      const result = await setup_command.execute(cmd_interaction)

      expect(result.content).toMatch("installed on this server")
    })
  })
})
