const presenter = require("./saved-roll-presenter")

describe("saved roll presenter", () => {
  describe("present", () => {
    it("shows the name", () => {
      const saved_roll = {
        name: "test1",
        description: "a description",
        options: {},
        command: "nwod",
      }

      const result = presenter.present(saved_roll, "en-US")

      expect(result).toMatch("test1")
    })

    it("shows the description", () => {
      const saved_roll = {
        name: "test1",
        description: "a description",
        options: {},
        command: "nwod",
      }

      const result = presenter.present(saved_roll, "en-US")

      expect(result).toMatch("description")
    })

    it("shows the command", () => {
      const saved_roll = {
        name: "test1",
        description: "a description",
        options: {},
        command: "nwod",
      }

      const result = presenter.present(saved_roll, "en-US")

      expect(result).toMatch("/nwod")
    })

    it("shows options", () => {
      const saved_roll = {
        name: "test1",
        description: "a description",
        options: { pool: 5 },
        command: "nwod",
      }

      const result = presenter.present(saved_roll, "en-US")

      expect(result).toMatch("*pool:* 5")
    })

    it("shows the invocation", () => {
      const saved_roll = {
        name: "test1",
        description: "a description",
        options: { pool: 5 },
        command: "nwod",
      }

      const result = presenter.present(saved_roll, "en-US")

      expect(result).toMatch("`/nwod pool:5`")
    })
  })

  describe("presentList", () => {
    it("shows each command", () => {
      const rolls = [
        { name: "test1", description: "a description", options: {} },
        { name: "test2", description: "a description", options: {} },
      ]

      const result = presenter.presentList(rolls, "en-US")

      expect(result).toMatch("test1")
      expect(result).toMatch("test2")
    })

    it("shows each invocation", () => {
      const rolls = [
        {
          name: "test1",
          description: "a description",
          options: {},
          command: "nwod",
        },
        {
          name: "test2",
          description: "a description",
          options: {},
          command: "fate",
        },
      ]

      const result = presenter.presentList(rolls, "en-US")

      expect(result).toMatch("/nwod")
      expect(result).toMatch("/fate")
    })
  })

  describe("presentInvocation", () => {
    it("shows the command name", () => {
      const roll = { command: "nwod", options: {} }

      const result = presenter.presentInvocation(roll, "en-US")

      expect(result).toMatch("nwod")
    })

    it("handles missing command name", () => {
      const roll = { options: {} }

      const result = presenter.presentInvocation(roll, "en-US")

      expect(result).not.toMatch("undefined")
    })

    it("shows each option", () => {
      const roll = { command: "nwod", options: { pool: 3, until: 5, rote: true } }

      const result = presenter.presentInvocation(roll, "en-US")

      expect(result).toMatch("pool:3")
      expect(result).toMatch("until:5")
      expect(result).toMatch("rote:true")
    })

    it("shows shared options", () => {
      const roll = { command: "roll", options: { pool: 3, sides: 4 } }

      const result = presenter.presentInvocation(roll, "en-US")

      expect(result).toMatch("pool:3")
    })

    it("handles missing options", () => {
      const roll = { command: "nwod" }

      const result = presenter.presentInvocation(roll, "en-US")

      expect(result).not.toMatch("undefined")
    })
  })
})
