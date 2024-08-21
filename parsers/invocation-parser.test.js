const { parse } = require("./invocation-parser")

describe("with junk input", () => {
  it("errors early", async () => {
    await expect(parse("something something explosions")).rejects.toThrow("invalid")
  })
})

describe("with an unknown command", () => {
  it("errors early", async () => {
    await expect(parse("/nopealope pool:3")).rejects.toThrow("cannot save")
  })
})

describe("with a non-savable command", () => {
  it("errors early", async () => {
    await expect(parse("/chop")).rejects.toThrow("cannot save")
  })
})

describe("with a savable command", () => {
  describe("with invalid options", () => {
    it("throws validation errors", async () => {
      await expect(parse("/roll pool:3")).rejects.toThrow('"sides" is required')
    })
  })

  describe("with valid options", () => {
    it("returns the command name", async () => {
      const result = await parse("/roll pool:3 sides:6 modifier:2")

      expect(result.command).toEqual("roll")
    })

    it("returns converted options object", async () => {
      const result = await parse("/roll pool:3 sides:6 modifier:2")

      expect(result.options).toMatchObject({
        pool: 3,
        sides: 6,
        modifier: 2,
      })
    })
  })
})

describe("spot checks", () => {
  it.each([
    ["/d20", {}],
    ["/d20 modifier:4", { modifier: 4 }],
    ["/fate", {}],
    ["/fate modifier:3", { modifier: 3 }],
    ["/fate modifier:-3", { modifier: -3 }],
    ["/nwod pool:6", { pool: 6 }],
    [
      "/nwod pool:6 explode:9 threshold:9 rote:true",
      {
        pool: 6,
        explode: 9,
        threshold: 9,
        rote: true,
      },
    ],
    [
      "/roll-formula formula:3d6 + 1d8 + 5",
      {
        formula: "3d6 + 1d8 + 5",
      },
    ],
    [
      "/roll pool:2 sides:12 modifier:18",
      {
        pool: 2,
        sides: 12,
        modifier: 18,
      },
    ],
    [
      "/wod20 pool:7 difficulty:8 specialty:true",
      {
        pool: 7,
        difficulty: 8,
        specialty: true,
      },
    ],
    [
      "/drh discipline:3 pain:2 exhaustion:1 talent:major",
      {
        discipline: 3,
        pain: 2,
        exhaustion: 1,
        talent: "major",
      }
    ]
  ])("parses %s", async (invocation, expected_options) => {
    const result = await parse(invocation)

    expect(result.options).toMatchObject(expected_options)
  })
})
