const wod_command = require("./wod20")

const { Interaction } = require("../testing/interaction")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("schema", () => {
  describe("pool", () => {
    const pool_schema = wod_command.schema.extract("pool")

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

  describe("until", () => {
    const until_schema = wod_command.schema.extract("until")

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
  describe("with one roll", () => {
    it("displays the description if present", async () => {
      const description_text = "this is a test"
      const options = {
        rolls: 1,
        pool: 1,
        description: description_text
      }

      const result = wod_command.perform(options)

      expect(result).toMatch(description_text)
    })

    it("displays the result", async () => {
      const options = {
        rolls: 1,
        pool: 1,
      }

      const result = wod_command.perform(options)

      expect(result).toMatch(/\*\*(botch|\d)\*\*/)
    })
  })

  describe("with multiple rolls", () => {
    it("displays the description if present", async () => {
      const description_text = "this is a test"
      const options = {
        rolls: 2,
        pool: 1,
        description: description_text
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
        description: description_text
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
  describe("secret", () => {
    it("when secret is true, reply is ephemeral", async () => {
      interaction.command_options.secret = true

      await wod_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeTruthy()
    })

    it("when secret is false, reply is not ephemeral", async () => {
      interaction.command_options.secret = false

      await wod_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeFalsy()
    })

    it("secret defaults to false", async () => {
      await wod_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeFalsy()
    })
  })
})
