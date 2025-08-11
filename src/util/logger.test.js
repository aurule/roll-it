const { pickStream } = require("./logger")

describe("logger", () => {
  let old_env

  beforeAll(() => {
    old_env = process.env
  })

  afterAll(() => {
    process.env = old_env
  })

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...old_env }
  })

  it("creates a pino instance", () => {
    const { logger } = require("./logger")
    expect(logger).toBeTruthy()
  })

  describe("pickStream", () => {
    it.concurrent.each([
      ["development", "Transform"],
      ["test", "DevNull"],
      ["ci", "DevNull"],
      // we intentionally do not test the production logger, since it makes a live connection to papertrail
    ])("in %s env, uses %s object", async (env_name, obj_name) => {
      const log_stream = pickStream(env_name)

      expect(log_stream.constructor.name).toMatch(obj_name)
    })

    it("throws an error on unknown env", () => {
      expect(() => pickStream("oceanic")).toThrow("unknown environment")
    })
  })
})
