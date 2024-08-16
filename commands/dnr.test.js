const dnr_command = require("./dnr")

const { Interaction } = require("../testing/interaction")
const { schemaMessages } = require("../testing/schema-messages")
const { test_secret_option } = require("../testing/shared/execute-secret")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("schema", () => {
  describe("discipline", () => {
    it.todo("is required")
    it.todo("has a min of 1")
    it.todo("has a max of 6")
  })

  describe("pain", () => {
    it.todo("is required")
    it.todo("has a min of 1")
  })

  describe("exhaustion", () => {
    it.todo("is optional")
    it.todo("has a min of 1")
    it.todo("has a max of 6")
  })

  describe("madness", () => {
    it.todo("is optional")
    it.todo("has a min of 1")
    it.todo("has a max of 8")
  })

  describe("talent", () => {
    it.todo("is optional")
    it.each([['minor'], ['major'], ['madness']])("allows %s", (talent_value) => {
      return
    })
    it.todo("minor requires exhaustion")
    it.todo("major requires exhaustion")
    it.todo("madness requires madness")
  })
})

describe.skip("perform", () => {
  it("includes the description", () => {
    const options = {
      rolls: 1,
      description: "test desc",
    }

    const result = dnr_command.perform(options)

    expect(result).toMatch("test desc")
  })
})

describe.skip("execute", () => {
  it("performs the roll", () => {
    interaction.command_options.description = "test desc"

    dnr_command.execute(interaction)

    expect(interaction.replyContent).toMatch("test desc")
  })

  test_secret_option(dnr_command)
})
