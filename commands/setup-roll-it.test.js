const setup_command = require("./setup-roll-it")

it("is global", () => {
  expect(setup_command.global).toBeTruthy()
})
