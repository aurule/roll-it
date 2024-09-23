const { Interaction } = require("../../testing/interaction")
const { test_secret_option } = require("../../testing/shared/execute-secret")

const met_opposed_command = require("./opposed")

it("has a description", () => {
  expect(met_opposed_command.description).toBeTruthy()
})
