import { CommandOptions, digOptions } from "./command-options"

describe("digOptions helper", () => {
  it("with empty data, returns empty array", () => {
    const options = {
      data: [],
    }

    const result = digOptions(options)

    expect(result).toEqual([])
  })

  it("with top-level options, returns those directly", () => {
    const options = {
      data: [
        {
          name: "test",
          type: 4,
          value: "yes",
        },
      ],
    }

    const result = digOptions(options)

    expect(result).toEqual(options.data)
  })

  it("with subcommand options, returns nested options object", () => {
    const options = {
      data: [
        {
          name: "child",
          options: [
            {
              name: "test",
              type: 4,
              value: "yes",
            },
          ],
        },
      ],
    }

    const result = digOptions(options)

    expect(result).toEqual(options.data[0].options)
  })
})

describe("command options class", () => {
  describe("with discord interaction", () => {
    it("stores name and value from each option object", () => {
      const options = {
        data: [
          {
            name: "test",
            type: 4,
            value: "yes",
          },
        ],
      }

      const cmd_opts = new CommandOptions(options)

      expect(cmd_opts.data.has("test")).toBe(true)
    })
  })

  describe("with plain object", () => {
    it("stores own attributes of the object", () => {
      const options = { test: "yes" }

      const cmd_opts = new CommandOptions(options)

      expect(cmd_opts.data.has("test")).toBe(true)
    })
  })

  describe("get", () => {
    it("retrieves the named option", () => {
      const cmd_opts = new CommandOptions({ test: "yes" })

      const result = cmd_opts.get("test")

      expect(result).toBe("yes")
    })
  })

  describe("toJSON", () => {
    it("creates an object with one attribute per data key", () => {
      const cmd_opts = new CommandOptions({ test: "yes" })

      const result = cmd_opts.toJSON()

      expect(result.test).toBe("yes")
    })
  })

  it("can rehydrate its own json-ified output", () => {
    const opts1 = new CommandOptions({ test: "yes" })

    const opts2 = new CommandOptions(opts1.toJSON())

    expect(opts2.get("test")).toBe("yes")
  })
})
