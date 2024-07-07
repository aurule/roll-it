const chooser_command = require("./roll-chooser")

const { Interaction } = require("../testing/interaction")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe.skip("execute", () => {
  it.todo("prompts the user to choose commands")
  // not sure how to test this yet, since it relies extremely heavily on user interaction
})
