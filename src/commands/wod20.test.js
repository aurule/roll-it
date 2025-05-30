const wod_command = require("./wod20")

const { test_secret_option } = require("../../testing/shared/execute-secret")

var interaction

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
    it("returns the correct message", () => {
      const pool = 6
      const difficulty = 8
      const results = [4]

      const result = wod_command.judge(results, pool, difficulty, "en-US")

      expect(result).toMatch("pleases")
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

    it("thinks about the hummingbird message", () => {
      // The message is not easy to test, thanks to randomess and the very low chance of the required
      // successes.
      options.description = "perception"

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

test_secret_option(wod_command)
