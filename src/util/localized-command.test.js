const { canonical, mapped } = require("../locales/helpers")

const { LocalizedSlashCommandBuilder, LocalizedSubcommandBuilder } = require("./localized-command")

describe("localized command builders", () => {
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

        expect(extracted.description_localizations).toEqual(
          mapped("description", "8ball", "question"),
        )
      })
    })

    describe("injectLocalizeChoices", () => {
      it("adds the method to the option", () => {
        const command = new LocalizedSlashCommandBuilder("8ball")
        const option = {}

        command.injectLocalizeChoices(option)

        expect(option.setLocalizedChoices).toBeTruthy()
      })

      describe("setLocalizedChoices", () => {
        it("populates choice name", () => {
          const command = new LocalizedSlashCommandBuilder("curv")
          let extracted

          command.addLocalizedStringOption("with", (option) => {
            extracted = option
            option.setLocalizedChoices("advantage")
            return option
          })

          expect(extracted.choices[0].name).toEqual(canonical("choices.advantage", "curv", "with"))
        })

        it("populates choice localized names", () => {
          const command = new LocalizedSlashCommandBuilder("curv")
          let extracted

          command.addLocalizedStringOption("with", (option) => {
            extracted = option
            option.setLocalizedChoices("advantage")
            return option
          })

          expect(extracted.choices[0].name_localizations).toEqual(
            mapped("choices.advantage", "curv", "with"),
          )
        })

        it("populates choice value", () => {
          const command = new LocalizedSlashCommandBuilder("curv")
          let extracted

          command.addLocalizedStringOption("with", (option) => {
            extracted = option
            option.setLocalizedChoices("advantage")
            return option
          })

          expect(extracted.choices[0].value).toEqual("advantage")
        })
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

      describe("string options", () => {
        it("creates string options", () => {
          const command = new LocalizedSlashCommandBuilder("8ball")
          let extracted

          command.addLocalizedOption("question", "string", (option) => {
            extracted = option
            return option
          })

          expect(extracted).toBeTruthy()
        })

        it("injects choices helper", () => {
          const command = new LocalizedSlashCommandBuilder("8ball")
          let extracted

          command.addLocalizedOption("question", "string", (option) => {
            extracted = option
            return option
          })

          expect(extracted.setLocalizedChoices).toBeTruthy()
        })
      })

      describe("option types", () => {
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

        it("creates user options", () => {
          const command = new LocalizedSubcommandBuilder("opposed", "met")
          let extracted

          command.addLocalizedOption("opponent", "user", (option) => {
            extracted = option
            return option
          })

          expect(extracted).toBeTruthy()
        })

        it("creates attachment options", () => {
          const command = new LocalizedSubcommandBuilder("opposed", "met")
          let extracted

          command.addLocalizedOption("opponent", "attachment", (option) => {
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

      describe("with an optionfn", () => {
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
})
