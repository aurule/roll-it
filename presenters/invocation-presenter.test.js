const { present } = require("./invocation-presenter")

it("adds a slash to command name", () => {
  const command_name = "test"
  const options = {lying: true}

  const result = present(command_name, options)

  expect(result).toMatch("/test")
})

it("adds all options", () => {
  const command_name = "test"
  const options = {
    lying: true,
    modifier: 5,
  }

  const result = present(command_name, options)

  expect(result).toMatch("lying:")
  expect(result).toMatch("modifier:")
})

it("handles booleans", () => {
  const command_name = "test"
  const options = {lying: true}

  const result = present(command_name, options)

  expect(result).toMatch("lying:true")
})

it("handles numbers", () => {
  const command_name = "test"
  const options = {pool: 18}

  const result = present(command_name, options)

  expect(result).toMatch("pool:18")
})

it("handles strings", () => {
  const command_name = "test"
  const options = {words: "a brief comment"}

  const result = present(command_name, options)

  expect(result).toMatch("words:a brief comment")
})

it("handles empty options", () => {
  const command_name = "test"
  const options = {}

  const result = present(command_name, options)

  expect(result).toMatch("`/test`")
})
