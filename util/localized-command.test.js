const { canonical, mapped } = require("../locales/helpers")

const { LocalizedSlashCommandBuilder, LocalizedSubcommandBuilder } = require("./localized-command")

describe("LocalizedSlashCommandBuilder", () => {
  describe("constructor", () => {
    it("sets the name", () => {
      const command = new LocalizedSlashCommandBuilder("8ball")

      expect(command.name).toEqual("8ball")
    })

    it("sets the default description", () => {
      const command = new LocalizedSlashCommandBuilder("8ball")

      expect(command.description).toEqual(canonical("description", "8ball"))
    })

    it("populates name map", () => {
      const command = new LocalizedSlashCommandBuilder("8ball")

      expect(command.name_localizations).toEqual(mapped("name", "8ball"))
    })

    it("populates description map", () => {
      const command = new LocalizedSlashCommandBuilder("8ball")

      expect(command.description_localizations).toEqual(mapped("description", "8ball"))
    })

    describe("with a key", () => {
      it("uses the given key", () => {
        const command = new LocalizedSlashCommandBuilder("command", "help.command")

        expect(command.description_localizations).toEqual(mapped("description", "help.command"))
      })
    })

    describe("without a key", () => {
      it("uses the command name", () => {
        const command = new LocalizedSlashCommandBuilder("8ball")

        expect(command.description_localizations).toEqual(mapped("description", "8ball"))
      })
    })
  })

  describe("localizeOption", () => {
    it("sets the default description", () => {
      const command = new LocalizedSlashCommandBuilder("8ball")
      let extracted

      command.addStringOption((option) => {
        extracted = option
        option.setName("question")
        command.localizeOption(option)
        return option
      })

      expect(extracted.description).toEqual(canonical("description", "8ball", "question"))
    })

    it("populates name map", () => {
      const command = new LocalizedSlashCommandBuilder("8ball")
      let extracted

      command.addStringOption((option) => {
        extracted = option
        option.setName("question")
        command.localizeOption(option)
        return option
      })

      expect(extracted.name_localizations).toEqual(mapped("name", "8ball", "question"))
    })

    it("populates description map", () => {
      const command = new LocalizedSlashCommandBuilder("8ball")
      let extracted

      command.addStringOption((option) => {
        extracted = option
        option.setName("question")
        command.localizeOption(option)
        return option
      })

      expect(extracted.description_localizations).toEqual(mapped("description", "8ball", "question"))
    })
  })

  describe("addLocalizedOption", () => {
    it("sets the name", () => {
      const command = new LocalizedSlashCommandBuilder("8ball")
      let extracted

      command.addLocalizedOption("question", "string", (option) => {
        extracted = option
        return option
      })

      expect(extracted.name).toEqual("question")
    })

    it("populates the name map", () => {
      const command = new LocalizedSlashCommandBuilder("8ball")
      let extracted

      command.addLocalizedOption("question", "string", (option) => {
        extracted = option
        return option
      })

      expect(extracted.name_localizations).toEqual(mapped("name", "8ball", "question"))
    })

    describe("option types", () => {
      it("creates string options", () => {
        const command = new LocalizedSlashCommandBuilder("8ball")
        let extracted

        command.addLocalizedOption("question", "string", (option) => {
          extracted = option
          return option
        })

        expect(extracted).toBeTruthy()
      })

      it("creates integer options", () => {
        const command = new LocalizedSlashCommandBuilder("curv")
        let extracted

        command.addLocalizedOption("modifier", "integer", (option) => {
          extracted = option
          return option
        })

        expect(extracted).toBeTruthy()
      })

      it("creates boolean options", () => {
        const command = new LocalizedSlashCommandBuilder("8ball")
        let extracted

        command.addLocalizedOption("doit", "string", (option) => {
          extracted = option
          return option
        })

        expect(extracted).toBeTruthy()
      })

      it("errors on unknown option type", () => {
        const command = new LocalizedSlashCommandBuilder("8ball")
        let extracted

        expect(() => {
          command.addLocalizedOption("doit", "fancy")
        }).toThrow("unknown option type")
      })
    })

    describe("with a callable", () => {
      it("invokes the callable", () => {
        const command = new LocalizedSlashCommandBuilder("8ball")
        let called = false

        command.addLocalizedOption("doit", "string", (option) => {
          called = true
          return option
        })

        expect(called).toEqual(true)
      })
    })

    describe("with no callable", () => {
      it("creates the option", () => {
        const command = new LocalizedSlashCommandBuilder("8ball")
        let called = false

        command.addLocalizedOption("doit", "string")

        expect(command.options[0].name).toEqual("doit")
      })
    })
  })
})

describe("LocalizedSubcommandBuilder", () => {
  it("uses data for the subcommand", () => {
    const command = new LocalizedSubcommandBuilder("command", "help")

      expect(command.description).toEqual(canonical("description", "help.command"))
  })
})
