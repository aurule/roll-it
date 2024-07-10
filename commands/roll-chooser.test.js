const chooser_command = require("./roll-chooser")

const { Interaction } = require("../testing/interaction")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

it("is global", () => {
  expect(chooser_command.global).toBeTruthy()
})
