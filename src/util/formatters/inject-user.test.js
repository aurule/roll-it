const { injectMention } = require("./inject-user")

describe("inject-user helper", () => {
  it("uses the given user snowflake", () => {
    const template = "{{userMention}} did a thing"

    const result = injectMention(template, "testflake")

    expect(result).toMatch("testflake")
  })

  it("replaces all placeholders", () => {
    const template = "{{userMention}} and then {{userMention}}"

    const result = injectMention(template, "testflake")

    expect(result.match(/testflake/g).length).toEqual(2)
  })
})
