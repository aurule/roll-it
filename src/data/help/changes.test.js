import { getChangelog, data } from "./changes.js"
import package_data from "../../../package.json" with { type: "json" }

describe("changes help topic", () => {
  describe("getChangelog", () => {
    it("reads changelog file when present", () => {
      const changelog = getChangelog("1.0.0", "en-US").toString()

      expect(changelog).toMatch("official stable release")
    })

    it("returns no changelog message when no changelog exists", () => {
      const changelog = getChangelog("0.5.0", "en-US")

      expect(changelog).toMatch("No changelog available for 0.5.0")
    })
  })

  describe("data", () => {
    it("includes the current version", () => {
      const help_data = data("en-US")

      expect(help_data.version).toEqual(package_data.version)
    })

    it("includes the latest changelog", () => {
      const help_data = data("en-US")

      expect(help_data.changelog.toString()).toMatch("Changelog for Roll It")
    })
  })
})
