const changesTopic = require("./changes")
const { version } = require("../../../package.json")

describe("getChangelog", () => {
  it("reads changelog file when present", () => {
    const changelog = changesTopic.getChangelog("1.0.0", "en-US").toString()

    expect(changelog).toMatch("official stable release")
  })

  it("returns no changelog message when no changelog exists", () => {
    const changelog = changesTopic.getChangelog("0.5.0", "en-US")

    expect(changelog).toMatch("No changelog available for 0.5.0")
  })
})
