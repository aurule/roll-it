const presenter = require("./saved-roll-presenter")
const { i18n } = require("../locales")

const t = i18n.getFixedT("en-US", "commands", "saved")

describe("present", () => {
  it("shows the name", () => {
    const saved_roll = {
      name: "test1",
      description: "a description",
      options: {},
      command: "nwod",
    }

    const result = presenter.present(saved_roll, t)

    expect(result).toMatch("test1")
  })

  it("shows the description", () => {
    const saved_roll = {
      name: "test1",
      description: "a description",
      options: {},
      command: "nwod",
    }

    const result = presenter.present(saved_roll, t)

    expect(result).toMatch("description")
  })

  it("shows the command", () => {
    const saved_roll = {
      name: "test1",
      description: "a description",
      options: {},
      command: "nwod",
    }

    const result = presenter.present(saved_roll, t)

    expect(result).toMatch("/nwod")
  })

  it("shows options", () => {
    const saved_roll = {
      name: "test1",
      description: "a description",
      options: { pool: 5 },
      command: "nwod",
    }

    const result = presenter.present(saved_roll, t)

    expect(result).toMatch("*pool:* 5")
  })

  it("shows the invocation", () => {
    const saved_roll = {
      name: "test1",
      description: "a description",
      options: { pool: 5 },
      command: "nwod",
    }

    const result = presenter.present(saved_roll, t)

    expect(result).toMatch("`/nwod pool:5`")
  })
})

describe("presentList", () => {
  it("shows each command", () => {
    const rolls = [
      { name: "test1", description: "a description", options: {} },
      { name: "test2", description: "a description", options: {} },
    ]

    const result = presenter.presentList(rolls, t)

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

    const result = presenter.presentList(rolls, t)

    expect(result).toMatch("/nwod")
    expect(result).toMatch("/fate")
  })
})

describe("presentInvocation", () => {
  it("shows the command name", () => {
    const roll = { command: "nwod", options: {} }

    const result = presenter.presentInvocation(roll)

    expect(result).toMatch("nwod")
  })

  it("handles missing command name", () => {
    const roll = { options: {} }

    const result = presenter.presentInvocation(roll)

    expect(result).not.toMatch("undefined")
  })

  it("shows each option", () => {
    const roll = { command: "nwod", options: { pool: 3, until: 5, rote: true } }

    const result = presenter.presentInvocation(roll)

    expect(result).toMatch("pool")
    expect(result).toMatch("until")
    expect(result).toMatch("rote")
  })

  it("handles missing options", () => {
    const roll = { command: "nwod" }

    const result = presenter.presentInvocation(roll)

    expect(result).not.toMatch("undefined")
  })
})
