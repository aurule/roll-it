const { Interaction } = require("../../testing/interaction")
const { test_secret_option } = require("../../testing/shared/execute-secret")

const met_opposed_command = require("./opposed")

it("has a description", () => {
  expect(met_opposed_command.description).toBeTruthy()
})

describe("execute", () => {
  let interaction

  beforeEach(() => {
    interaction = new Interaction()
  })

  it("errors on self opponent", () => {
    interaction.command_options.opponent = {id: interaction.user.id}

    met_opposed_command.execute(interaction)

    expect(interaction.replyContent).toMatch("cannot challenge yourself")
  })
})
