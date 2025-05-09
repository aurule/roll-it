const nwod_command = require("./nwod")

const { Interaction } = require("../../testing/interaction")
const { schemaMessages } = require("../../testing/schema-messages")
const { test_secret_option } = require("../../testing/shared/execute-secret")

describe("nwod command", () => {
  describe("schema", () => {
    describe("explode", () => {
      const explode_schema = nwod_command.schema.extract("explode")

      it("is optional", () => {
        const result = explode_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it("is an int", () => {
        const result = explode_schema.validate(8.4)

        expect(result.error).toBeTruthy()
      })

      it("min of 2", () => {
        const result = explode_schema.validate(1)

        expect(result.error).toBeTruthy()
      })

      it("max of 11", () => {
        const result = explode_schema.validate(12)

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const result = explode_schema.validate(7)

        expect(result.error).toBeFalsy()
      })
    })

    describe("threshold", () => {
      const threshold_schema = nwod_command.schema.extract("threshold")

      it("is optional", () => {
        const result = threshold_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it("is an int", () => {
        const result = threshold_schema.validate(5.5)

        expect(result.error).toBeTruthy()
      })

      it("min of 2", () => {
        const result = threshold_schema.validate(1)

        expect(result.error).toBeTruthy()
      })

      it("max of 10", () => {
        const result = threshold_schema.validate(11)

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const result = threshold_schema.validate(9)

        expect(result.error).toBeFalsy()
      })
    })

    describe("rote", () => {
      const rote_schema = nwod_command.schema.extract("rote")

      it("is optional", () => {
        const result = rote_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it("is a bool", () => {
        const result = rote_schema.validate("yes")

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const result = rote_schema.validate(true)

        expect(result.error).toBeFalsy()
      })
    })

    describe("decreasing", () => {
      const decreasing_schema = nwod_command.schema.extract("decreasing")

      it("is optional", () => {
        const result = decreasing_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it("is a bool", () => {
        const result = decreasing_schema.validate("yes")

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const result = decreasing_schema.validate(true)

        expect(result.error).toBeFalsy()
      })
    })
  })

  describe("judge", () => {
    describe("with dominant outcome", () => {
      it("returns the correct message", () => {
        const pool = 6
        const results = [4]

        const result = nwod_command.judge(results, pool, "en-US")

        expect(result).toMatch("pleases")
      })
    })

    describe("with no dominant outcome", () => {
      it("returns the neutral message", () => {
        const pool = 6
        const results = [0, 2, 4]

        const result = nwod_command.judge(results, pool, "en-US")

        expect(result).toMatch("noted")
      })
    })
  })

  describe("perform", () => {
    describe("normal mode", () => {
      let options

      beforeEach(() => {
        options = {
          pool: 10,
        }
      })

      it("displays the description if present", () => {
        const description_text = "this is a test"
        options.description = description_text

        const result = nwod_command.perform(options)

        expect(result).toMatch(description_text)
      })

      it("displays the result", () => {
        const description_text = "this is a test"
        const options = {
          pool: 5,
        }

        const result = nwod_command.perform(options)

        expect(result).toMatch(/\*\*\d\*\*/)
      })

      it("displays the sacrifice message", () => {
        options.description = "sacrifice"

        const result = nwod_command.perform(options)

        expect(result).toMatch("Your sacrifice")
      })

      it("thinks about the hummingbird message", () => {
        // The message is not easy to test, thanks to randomess and the very low chance of the required
        // successes.
        options.description = "perception"

        const result = nwod_command.perform(options)

        expect(result).toMatch(/\*\*\d\*\*/)
      })
    })

    describe("until mode", () => {
      let options

      beforeEach(() => {
        options = {
          pool: 10,
          explode: 10,
          threshold: 8,
          rolls: 1,
          until: 2,
        }
      })

      it("displays the description if present", () => {
        const description_text = "this is a test"
        options.description = description_text

        const result = nwod_command.perform(options)

        expect(result).toMatch(description_text)
      })

      it("displays the result", () => {
        const result = nwod_command.perform(options)

        expect(result).toMatch(/\*\*\d\*\*/)
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

        nwod_command.execute(interaction)

        expect(interaction.replyContent).toMatch("cannot use teamwork")
      })

      it("does not work with rote option", async () => {
        interaction.command_options.teamwork = true
        interaction.command_options.rote = true

        nwod_command.execute(interaction)

        expect(interaction.replyContent).toMatch("cannot use teamwork")
      })

      it("does not work with until option", async () => {
        interaction.command_options.teamwork = true
        interaction.command_options.until = 5

        nwod_command.execute(interaction)

        expect(interaction.replyContent).toMatch("cannot use teamwork")
      })

      it("does not work with secret option", async () => {
        interaction.command_options.teamwork = true
        interaction.command_options.secret = true

        nwod_command.execute(interaction)

        expect(interaction.replyContent).toMatch("cannot use teamwork")
      })

      it("does not work with chance option", async () => {
        interaction.command_options.teamwork = true
        interaction.command_options.pool = 0

        nwod_command.execute(interaction)

        expect(interaction.replyContent).toMatch("cannot use teamwork")
      })
    })

    test_secret_option(nwod_command)
  })
})
