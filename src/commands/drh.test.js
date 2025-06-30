const drh_command = require("./drh")

const { CommandInteraction } = require("../../testing/command-interaction")
const { schemaMessages } = require("../../testing/schema-messages")
const { test_secret_option } = require("../../testing/shared/execute-secret")

describe("/drh command", () => {
  describe("schema", () => {
    describe("discipline", () => {
      const discipline_schema = drh_command.schema.extract("discipline")

      it("is required", () => {
        const result = discipline_schema.validate()

        expect(result.error).toBeTruthy()
      })

      it("is an int", () => {
        const result = discipline_schema.validate(3.5)

        expect(result.error).toBeTruthy()
      })

      it("has a min of 1", () => {
        const result = discipline_schema.validate(0)

        expect(result.error).toBeTruthy()
      })

      it("has a max of 6", () => {
        const result = discipline_schema.validate(7)

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const result = discipline_schema.validate(4)

        expect(result.error).toBeFalsy()
      })
    })

    describe("pain", () => {
      const pain_schema = drh_command.schema.extract("pain")

      it("is required", () => {
        const result = pain_schema.validate()

        expect(result.error).toBeTruthy()
      })

      it("is an int", () => {
        const result = pain_schema.validate(3.5)

        expect(result.error).toBeTruthy()
      })

      it("has a min of 0", () => {
        const result = pain_schema.validate(0)

        expect(result.error).toBeTruthy()
      })

      it("has a max of 100", () => {
        const result = pain_schema.validate(101)

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const result = pain_schema.validate(4)

        expect(result.error).toBeFalsy()
      })
    })

    describe("exhaustion", () => {
      it("is optional", () => {
        const options = {
          discipline: 1,
          pain: 1,
        }

        const result = drh_command.schema.validate(options)

        expect(result.error).toBeFalsy()
      })

      it("is an int", () => {
        const options = {
          discipline: 1,
          pain: 1,
          exhaustion: 3.5,
        }

        const result = drh_command.schema.validate(options)

        expect(result.error).toBeTruthy()
      })

      it("has a min of 1", () => {
        const options = {
          discipline: 1,
          pain: 1,
          exhaustion: 0,
        }

        const result = drh_command.schema.validate(options)

        expect(result.error).toBeTruthy()
      })

      it("has a max of 6", () => {
        const options = {
          discipline: 1,
          pain: 1,
          exhaustion: 7,
        }

        const result = drh_command.schema.validate(options)

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const options = {
          discipline: 1,
          pain: 1,
          exhaustion: 4,
        }

        const result = drh_command.schema.validate(options)

        expect(result.error).toBeFalsy()
      })

      it("is required when talent is minor", () => {
        const options = {
          discipline: 1,
          pain: 1,
          talent: "minor",
        }

        const result = drh_command.schema.validate(options)

        expect(result.error).toBeTruthy()
      })

      it("is required when talent is major", () => {
        const options = {
          discipline: 1,
          pain: 1,
          talent: "major",
        }

        const result = drh_command.schema.validate(options)

        expect(result.error).toBeTruthy()
      })
    })

    describe("madness", () => {
      it("is optional", () => {
        const options = {
          discipline: 1,
          pain: 1,
        }

        const result = drh_command.schema.validate(options)

        expect(result.error).toBeFalsy()
      })

      it("is an int", () => {
        const options = {
          discipline: 1,
          pain: 1,
          madness: 3.5,
        }

        const result = drh_command.schema.validate(options)

        expect(result.error).toBeTruthy()
      })

      it("has a min of 1", () => {
        const options = {
          discipline: 1,
          pain: 1,
          madness: 0,
        }

        const result = drh_command.schema.validate(options)

        expect(result.error).toBeTruthy()
      })

      it("has a max of 8", () => {
        const options = {
          discipline: 1,
          pain: 1,
          madness: 9,
        }

        const result = drh_command.schema.validate(options)

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const options = {
          discipline: 1,
          pain: 1,
          madness: 4,
        }

        const result = drh_command.schema.validate(options)

        expect(result.error).toBeFalsy()
      })

      it("is required when talent is madness", () => {
        const options = {
          discipline: 1,
          pain: 1,
          talent: "madness",
        }

        const result = drh_command.schema.validate(options)

        expect(result.error).toBeTruthy()
      })
    })

    describe("talent", () => {
      const talent_schema = drh_command.schema.extract("talent")

      it("is optional", () => {
        const result = talent_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it.concurrent.each([["minor"], ["major"], ["madness"]])(
        "accepts %s",
        async (talent_value) => {
          const result = talent_schema.validate(talent_value)

          expect(result.error).toBeFalsy()
        },
      )

      it("disallows unknown values", () => {
        const result = talent_schema.validate("other")

        expect(result.error).toBeTruthy()
      })
    })
  })

  describe("roll_pool", () => {
    it("returns undefined with no dice", () => {
      const result = drh_command.roll_pool(0, "test")

      expect(result).toBeUndefined()
    })

    it("includes pool name", () => {
      const result = drh_command.roll_pool(1, "test")

      expect(result.name).toEqual("test")
    })

    it("includes raw results", () => {
      const result = drh_command.roll_pool(1, "test")

      expect(result.raw.length).toEqual(1)
    })

    it("includes summed results", () => {
      const result = drh_command.roll_pool(1, "test")

      expect(result.summed.length).toEqual(1)
    })
  })

  describe("perform", () => {
    it("rolls multiple times", () => {
      const options = {
        discipline: 1,
        pain: 1,
        rolls: 2,
      }

      const result = drh_command.perform(options)

      expect(result).toMatch("2 times")
    })
  })

  describe("execute", () => {
    let interaction

    beforeEach(() => {
      interaction = new CommandInteraction("drh")
    })

    describe("helper mode", () => {
      it("does the roll", async () => {
        interaction.setOptions({
          discipline: 1,
          pain: 0,
        })

        await drh_command.execute(interaction)

        expect(interaction.replyContent).toMatch("helped")
      })

      it("disallows talents", async () => {
        interaction.setOptions({
          discipline: 1,
          pain: 0,
          talent: "major",
        })

        await drh_command.execute(interaction)

        expect(interaction.replyContent).toMatch("cannot use a `talent`")
      })

      it("disallows other pools", async () => {
        interaction.setOptions({
          discipline: 1,
          pain: 0,
          exhaustion: 1,
        })

        await drh_command.execute(interaction)

        expect(interaction.replyContent).toMatch("can only roll `discipline`")
      })

      it("disallows modifier", async () => {
        interaction.setOptions({
          discipline: 1,
          pain: 0,
          modifier: 1,
        })

        await drh_command.execute(interaction)

        expect(interaction.replyContent).toMatch("cannot have a `modifier`")
      })
    })

    describe("normal mode", () => {
      it("performs the roll", async () => {
        interaction.setOptions({
          discipline: 1,
          pain: 1,
        })

        await drh_command.execute(interaction)

        expect(interaction.replyContent).toMatch("rolled")
      })

      it("with major talent, requires exhaustion", async () => {
        interaction.setOptions({
          talent: "major",
          discipline: 1,
          pain: 1,
        })

        await drh_command.execute(interaction)

        expect(interaction.replyContent).toMatch("need at least 1 `exhaustion`")
      })

      it("with minor talent, requires exhaustion", async () => {
        interaction.setOptions({
          talent: "minor",
          discipline: 1,
          pain: 1,
        })

        await drh_command.execute(interaction)

        expect(interaction.replyContent).toMatch("need at least 1 `exhaustion`")
      })

      it("allows exhaustion talent with exhaustion pool", async () => {
        interaction.setOptions({
          talent: "minor",
          discipline: 1,
          exhaustion: 1,
          pain: 1,
        })

        await drh_command.execute(interaction)

        expect(interaction.replyContent).toMatch("dominated")
      })

      it("with madness talent, requires madness", async () => {
        interaction.setOptions({
          talent: "madness",
          discipline: 1,
          pain: 1,
        })

        await drh_command.execute(interaction)

        expect(interaction.replyContent).toMatch("need at least 1 `madness`")
      })

      it("allows madness talent with madness pool", async () => {
        interaction.setOptions({
          talent: "madness",
          discipline: 1,
          exhaustion: 1,
          madness: 1,
          pain: 1,
        })

        await drh_command.execute(interaction)

        expect(interaction.replyContent).toMatch("dominated")
      })
    })

    test_secret_option(drh_command, { discipline: 1, pain: 1 })
  })
})
