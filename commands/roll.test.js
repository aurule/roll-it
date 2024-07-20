const roll_command = require("./roll")

const { Interaction } = require("../testing/interaction")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("schema", () => {
  describe("sides", () => {
    const sides_schema = roll_command.schema.extract("sides")

    it("is required", () => {
      const result = sides_schema.validate()

      expect(result.error).toBeTruthy()
    })

    it("is an integer", () => {
      const result = sides_schema.validate(1.5)

      expect(result.error).toBeTruthy()
    })

    it("must be at least 2", () => {
      const result = sides_schema.validate(0)

      expect(result.error).toBeTruthy()
    })

    it("must be at most 100000", () => {
      const result = sides_schema.validate(100001)

      expect(result.error).toBeTruthy()
    })

    it("allows expected values", () => {
      const result = sides_schema.validate(30)

      expect(result.error).toBeFalsy()
    })
  })
})

describe("perform", () => {
  describe("with one roll", () => {
    it("displays the description if present", () => {
      const options = {
        rolls: 1,
        pool: 1,
        sides: 2,
        modifier: 0,
        description: "test description",
      }

      const result = roll_command.perform(options)

      expect(result).toMatch("test description")
    })

    it.only("displays the result", () => {
      const options = {
        rolls: 1,
        pool: 1,
        sides: 2,
        modifier: 0,
      }

      const result = roll_command.perform(options)

      expect(result).toMatch(/\*\*\d\*\*/)
    })

    it("displays the modifier", () => {
      const options = {
        rolls: 1,
        pool: 1,
        sides: 2,
        modifier: 0,
        modifier: 8
      }

      const result = roll_command.perform(options)

      expect(result).toMatch("8")
    })
  })

  describe("with multiple rolls", () => {
    it("displays the description if present", () => {
      const options = {
        rolls: 2,
        pool: 1,
        sides: 2,
        modifier: 0,
        description: "test description",
      }

      const result = roll_command.perform(options)

      expect(result).toMatch("test description")
    })

    it("displays the result", () => {
      const options = {
        rolls: 2,
        pool: 1,
        sides: 2,
        modifier: 0,
      }

      const result = roll_command.perform(options)

      expect(result).toMatch(/\*\*\d\*\*/)
    })

    it("displays the modifier", () => {
      const options = {
        rolls: 2,
        pool: 1,
        sides: 2,
        modifier: 8
      }

      const result = roll_command.perform(options)

      expect(result).toMatch("8")
    })
  })
})

describe("execute", () => {
  describe("secret", () => {
    it("when secret is true, reply is ephemeral", () => {
      interaction.command_options.secret = true

      roll_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeTruthy()
    })

    it("when secret is false, reply is not ephemeral", () => {
      interaction.command_options.secret = false

      roll_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeFalsy()
    })

    it("secret defaults to false", () => {
      roll_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeFalsy()
    })
  })
})
