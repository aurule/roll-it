const commandsTopic = require("./commands")

describe("help", () => {
  it("shows slash command descriptions", () => {
    const help_text = commandsTopic.help()

    expect(help_text).toMatch("Flip a coin")
  })

  it("shows slash command names", () => {
    const help_text = commandsTopic.help()

    expect(help_text).toMatch("chop")
  })
})
