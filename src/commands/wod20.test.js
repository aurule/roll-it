const { test_secret_option } = require("../../testing/shared/execute-secret")
const { Interaction } = require("../../testing/interaction")

const wod_command = require("./wod20")

describe("wod20 command", () => {
  describe("schema", () => {
    describe("difficulty", () => {
      const difficulty_schema = wod_command.schema.extract("difficulty")

      it("is optional", () => {
        const result = difficulty_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it("is an int", () => {
        const result = difficulty_schema.validate(5.5)

        expect(result.error).toBeTruthy()
      })

      it("min of 2", () => {
        const result = difficulty_schema.validate(1)

        expect(result.error).toBeTruthy()
      })

      it("max of 10", () => {
        const result = difficulty_schema.validate(11)

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const result = difficulty_schema.validate(9)

        expect(result.error).toBeFalsy()
      })
    })

    describe("specialty", () => {
      const specialty_schema = wod_command.schema.extract("specialty")

      it("is optional", () => {
        const result = specialty_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it("is a bool", () => {
        const result = specialty_schema.validate("yes")

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const result = specialty_schema.validate(true)

        expect(result.error).toBeFalsy()
      })
    })
  })

  describe("judge", () => {
    describe("with dominant outcome", () => {
      const parameters = [
        // 3 expected successes
        [6, 6, 6, "pleases"],
        [6, 4, 6, "accepted"],
        [6, 3, 6, "noted"],
        [6, 2, 6, "inadequate"],
        [6, 0, 6, "angers"],
        // 2 expected successes
        [8, 4, 6, "pleases"],
        [8, 3, 6, "accepted"],
        [8, 2, 6, "noted"],
        [8, 1, 6, "inadequate"],
        [8, 0, 6, "angers"],
        // 1 expected success
        [9, 2, 6, "pleases"],
        [9, 1, 6, "noted"],
        [9, 0, 6, "angers"],
      ]
      it.concurrent.each(parameters)(`difficulty %i, returns the correct text for %i successes`, async (difficulty, sum, pool, text) => {
        const results = [[sum]]

        const result = wod_command.judge(results, pool, difficulty, "en-US")

        expect(result).toMatch(text)
      })
    })

    describe("with no dominant outcome", () => {
      it("returns the neutral message", () => {
        const pool = 6
        const difficulty = 8
        const results = [0, 2, 4]

        const result = wod_command.judge(results, pool, difficulty, "en-US")

        expect(result).toMatch("noted")
      })
    })
  })

  describe("perform", () => {
    describe("with one roll", () => {
      let options

      beforeEach(() => {
        options = {
          rolls: 1,
          pool: 1,
        }
      })

      it("displays the result", async () => {
        const result = wod_command.perform(options)

        expect(result).toMatch(/\*\*(botch|\d)\*\*/)
      })

      it("displays the description if present", async () => {
        const description_text = "this is a test"
        options.description = description_text

        const result = wod_command.perform(options)

        expect(result).toMatch(description_text)
      })

      it("displays the sacrifice message", () => {
        options.description = "sacrifice"

        const result = wod_command.perform(options)

        expect(result).toMatch("Your sacrifice")
      })

      it("displays the hummingbird message", () => {
        options.pool = 11
        options.difficulty = 1
        options.description = "perception"

        const result = wod_command.perform(options)

        expect(result).toMatch("hummingbird")
      })
    })

    describe("with multiple rolls", () => {
      it("displays the description if present", async () => {
        const description_text = "this is a test"
        const options = {
          rolls: 2,
          pool: 1,
          description: description_text,
        }

        const result = wod_command.perform(options)

        expect(result).toMatch(description_text)
      })

      it("displays the result", async () => {
        const options = {
          rolls: 2,
          pool: 1,
        }

        const result = wod_command.perform(options)

        expect(result).toMatch(/\*\*(botch|\d)\*\*/)
      })
    })

    describe("with until", () => {
      it("displays the description if present", async () => {
        const description_text = "this is a test"
        const options = {
          pool: 5,
          until: 1,
          difficulty: 5,
          description: description_text,
        }

        const result = wod_command.perform(options)

        expect(result).toMatch(description_text)
      })

      it("displays the result", async () => {
        const options = {
          pool: 5,
          until: 1,
          difficulty: 5,
        }

        const result = wod_command.perform(options)

        expect(result).toMatch(/\*\*(botch|\d)\*\*/)
      })
    })
  })

  describe("execute", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    describe("teamwork mode", () => {
      it("does not work with rolls option", async () => {
        interaction.command_options.teamwork = true
        interaction.command_options.rolls = 5

        wod_command.execute(interaction)

        expect(interaction.replyContent).toMatch("cannot use teamwork")
      })

      it("does not work with until option", async () => {
        interaction.command_options.teamwork = true
        interaction.command_options.until = 5

        wod_command.execute(interaction)

        expect(interaction.replyContent).toMatch("cannot use teamwork")
      })

      it("does not work with secret option", async () => {
        interaction.command_options.teamwork = true
        interaction.command_options.secret = true

        wod_command.execute(interaction)

        expect(interaction.replyContent).toMatch("cannot use teamwork")
      })

      it("shows the teamwork prompt with correct options", async () => {
        interaction.command_options.teamwork = true
        interaction.command_options.pool = 5

        await wod_command.execute(interaction)

        expect(interaction.replyContent).toMatch("started a teamwork")
      })
    })

    test_secret_option(wod_command)
  })
})
