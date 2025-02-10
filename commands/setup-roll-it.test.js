const { CommandInteraction } = require("../testing/command-interaction")

const setup_command = require("./setup-roll-it")

const api = require("../services/api")
jest.mock("../services/api")
api.getGuildCommands.mockResolvedValue([])
api.setGuildCommands.mockResolvedValue(true)

afterEach(() => {
  jest.clearAllMocks()
})

it("is global", () => {
  expect(setup_command.global).toBeTruthy()
})

describe("execute", () => {
  let cmd_interaction

  beforeEach(() => {
    cmd_interaction = new CommandInteraction({commandName: "setup-roll-it"})
  })

  describe("prompt", () => {
    let prompt

    beforeEach(async () => {
      await setup_command.execute(cmd_interaction)
      prompt = cmd_interaction.message
    })

    afterEach(() => {
      prompt.componentEvents.stop()
    })

    it("shows the prompt", () => {
      expect(prompt.content).toMatch("which dice rolling commands are available")
    })

    it("shows the system picker", () => {
      expect(prompt).toHaveComponent("system_picker")
    })

    it("shows the command picker", () => {
      expect(prompt).toHaveComponent("command_picker")
    })
  })

  describe("pickers", () => {
    let prompt

    beforeEach(async () => {
      await setup_command.execute(cmd_interaction)
      prompt = cmd_interaction.message
    })

    afterEach(() => {
      prompt.componentEvents.stop()
    })

    describe("system picker", () => {
      it("has options", () => {
        const system_picker = prompt.getComponent("system_picker")

        expect(system_picker.options.length).toBeGreaterThan(0)
      })
    })

    describe("command picker", () => {
      it("has options", () => {
        const command_picker = prompt.getComponent("command_picker")

        expect(command_picker.options.length).toBeGreaterThan(0)
      })
    })
  })

  describe("buttons", () => {
    let prompt

    beforeEach(async () => {
      await setup_command.execute(cmd_interaction)
      prompt = cmd_interaction.message
    })

    describe("cancel", () => {
      it("shows the cancelled response", async () => {
        expect.assertions(1)

        const outcome = prompt.untilEdited().then((opts) => {
          expect(opts.content).toMatch("Cancelled")
        })

        prompt.click("cancel_button")

        return outcome
      })

      it("does not update server commands", async () => {
        expect.assertions(1)

        const outcome = prompt.untilEdited().then((opts) => {
          expect(api.setGuildCommands).not.toHaveBeenCalled()
        })

        prompt.click("cancel_button")

        return outcome
      })
    })

    describe("go", () => {
      describe("with empty selection", () => {
        it("shows the empty response", async () => {
          await prompt.click("go_button")

          expect(prompt.content).toMatch("Removing server commands")
        })

        it("clears server commands", async () => {
          await prompt.click("go_button")

          expect(api.setGuildCommands).toHaveBeenCalledWith(expect.anything(), [])
        })
      })

      describe("with matching selection", () => {
        const selection = ["d20"]

        beforeEach(async () => {
          api.getGuildCommands.mockResolvedValue([{name: "d20"}])
          cmd_interaction = new CommandInteraction({commandName: "setup-roll-it"})
          await setup_command.execute(cmd_interaction)
          prompt = cmd_interaction.message
        })

        afterEach(() => {
          api.getGuildCommands.mockResolvedValue([])
        })

        it("does not change server commands", async () => {
          await prompt.select("command_picker", selection)

          await prompt.click("go_button")

          expect(api.setGuildCommands).not.toHaveBeenCalled()
        })

        it("shows the matching selection response", async () => {
          await prompt.select("command_picker", selection)

          await prompt.click("go_button")

          expect(prompt.content).toMatch("Leaving server commands unchanged")
        })
      })

      describe("with new selection", () => {
        it("shows the success response", async () => {
          await prompt.select("command_picker", ["d20"])

          await prompt.click("go_button")

          expect(prompt.content).toMatch("Updated server commands")
          expect(prompt.content).toMatch("d20")
        })

        it("sets server commands", async () => {
          await prompt.select("command_picker", ["d20"])

          await prompt.click("go_button")

          expect(api.setGuildCommands).toHaveBeenCalledWith(expect.anything(), ["d20"])
        })
      })
    })
  })

  describe("timeout", () => {
    it("shows the timeout response", async () => {
      await setup_command.execute(cmd_interaction)
      const prompt = cmd_interaction.message

      prompt.componentEvents.timeout()

      expect(prompt.content).toMatch("out of time")
    })
  })
})
