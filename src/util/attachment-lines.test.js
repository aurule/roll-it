const { fetchLines } = require("./attachment-lines")

describe("attached file line getters", () => {
  let dummy_attachment

  beforeEach(() => {
    dummy_attachment = { url: "" }
    jest.spyOn(global, "fetch").mockImplementation((_url) => {
      return Promise.resolve({
        text: () => "first\nsecond",
      })
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("splits on \\n", async () => {
    const result = await fetchLines(dummy_attachment)

    expect(result).toEqual(["first", "second"])
  })

  it("splits on \\r\\n", async () => {
    const result = await fetchLines(dummy_attachment)

    expect(result).toEqual(["first", "second"])
  })

  it("ignores trailing newline", async () => {
    const result = await fetchLines(dummy_attachment)

    expect(result).toEqual(["first", "second"])
  })
})
