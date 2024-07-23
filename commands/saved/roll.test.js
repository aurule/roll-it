const { UserSavedRolls } = require("../../db/saved_rolls")
const { Interaction } = require("../../testing/interaction")
const { test_secret_option } = require("../../testing/shared/execute-secret")

const saved_roll_command = require("./roll")

describe("execute", () => {
  it.todo("warns on missing roll")
  it.todo("warns on invalid")
  it.todo("warns on incomplete")
  it.todo("executes the roll")
  it.todo("warns and sets invalid if the roll errors")
})
