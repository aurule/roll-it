const chooser_command = require("./roll-chooser")

it("is global", () => {
  expect(chooser_command.global).toBeTruthy()
})
