var old_env

beforeAll(() => {
  old_env = process.env
})

afterAll(() => {
  process.env = old_env
})

describe("logger", () => {
  beforeEach(() => {
    jest.resetModules()
    process.env = { ...old_env }
  })

  it("creates a pino instance", () => {
    const { logger } = require("./logger")
    expect(logger).toBeTruthy()
  })

  describe("pickStream", () => {
    let pickStream

    beforeEach(() => {
      pickStream = require("./logger").pickStream
    })

    it.each([
      ["development", "Transform"],
      ["test", "DevNull"],
      ["ci", "DevNull"],
      ["production", "Pumpify"],
    ])("in %s env, uses %s object", (env_name, obj_name) => {
      const log_stream = pickStream(env_name)

      expect(log_stream.constructor.name).toMatch(obj_name)
    })

    it("throws an error on unknown env", () => {
      expect(() => pickStream("oceanic")).toThrow("unknown environment")
    })
  })
})
