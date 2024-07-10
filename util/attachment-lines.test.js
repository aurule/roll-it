const { fetchLines } = require("./attachment-lines")

let fetchMock

beforeEach(() => {
  fetchMock = jest.spyOn(global, "fetch")
})

afterEach(() => {
  fetchMock.mockRestore()
})

const dummy_attachment = { url: "" }

it("splits on \\n", async () => {
  fetchMock.mockImplementation((url) => {
    return Promise.resolve({
      text: () => "first\nsecond",
    })
  })

  const result = await fetchLines(dummy_attachment)

  expect(result).toEqual(["first", "second"])
})

it("splits on \\r\\n", async () => {
  fetchMock.mockImplementation((url) => {
    return Promise.resolve({
      text: () => "first\r\nsecond",
    })
  })

  const result = await fetchLines(dummy_attachment)

  expect(result).toEqual(["first", "second"])
})

it("ignores trailing newline", async () => {
  fetchMock.mockImplementation((url) => {
    return Promise.resolve({
      text: () => "first\nsecond\n",
    })
  })

  const result = await fetchLines(dummy_attachment)

  expect(result).toEqual(["first", "second"])
})
