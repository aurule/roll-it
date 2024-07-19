const nwod_command = require("./nwod")

const { Interaction } = require("../testing/interaction")
const { schemaMessages } = require("../testing/schema-messages")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("schema", () => {
  describe("pool", () => {
    const pool_schema = nwod_command.schema.extract("pool")

    it("is required", () => {
      const result = pool_schema.validate()

      expect(result.error).toBeTruthy()
    })

    it("is an int", () => {
      const result = pool_schema.validate(4.2)

      expect(result.error).toBeTruthy()
    })

    it("min of zero", () => {
      const result = pool_schema.validate(-1)

      expect(result.error).toBeTruthy()
    })

    it("max of 1000", () => {
      const result = pool_schema.validate(1001)

      expect(result.error).toBeTruthy()
    })

    it("accepts expected values", () => {
      const result = pool_schema.validate(5)

      expect(result.error).toBeFalsy()
    })
  })

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

  describe("until", () => {
    const until_schema = nwod_command.schema.extract("until")

    it("is optional", () => {
      const result = until_schema.validate()

      expect(result.error).toBeFalsy()
    })

    it("is an int", () => {
      const result = until_schema.validate(5.5)

      expect(result.error).toBeTruthy()
    })

    it("min of 1", () => {
      const result = until_schema.validate(0)

      expect(result.error).toBeTruthy()
    })

    it("max of 100", () => {
      const result = until_schema.validate(101)

      expect(result.error).toBeTruthy()
    })

    it("accepts expected values", () => {
      const result = until_schema.validate(8)

      expect(result.error).toBeFalsy()
    })
  })
})

describe("perform", () => {
  describe("normal mode", () => {
    it("displays the description if present", () => {
      const description_text = "this is a test"
      const options = {
        description: description_text
      }

      const result = nwod_command.perform(options)

      expect(result).toMatch(description_text)
    })

    it("displays the result", () => {
      const description_text = "this is a test"
      const options = {
        pool: 5
      }

      const result = nwod_command.perform(options)

      expect(result).toMatch(/\*\*\d\*\*/)
    })
  })

  describe("until mode", () => {
    const options = {
      pool: 10,
      explode: 10,
      threshold: 8,
      rolls: 1,
      until: 2,
    }

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

  describe("secret", () => {
    it("when secret is true, reply is ephemeral", () => {
      interaction.command_options.secret = true

      nwod_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeTruthy()
    })

    it("when secret is false, reply is not ephemeral", () => {
      interaction.command_options.secret = false

      nwod_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeFalsy()
    })

    it("secret defaults to false", () => {
      nwod_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeFalsy()
    })
  })
})
