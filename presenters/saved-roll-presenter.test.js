const presenter = require("./saved-roll-presenter")

describe("presentList", () => {
  it("shows each command", () => {
    const rolls = [
      {name: "test1", description: "a description", options: {}},
      {name: "test2", description: "a description", options: {}},
    ]

    const result = presenter.presentList(rolls)

    expect(result).toMatch("test1")
    expect(result).toMatch("test2")
  })

  it("shows each invocation", () => {
    const rolls = [
      {name: "test1", description: "a description", options: {}, command: "nwod"},
      {name: "test2", description: "a description", options: {}, command: "fate"},
    ]

    const result = presenter.presentList(rolls)

    expect(result).toMatch("/nwod")
    expect(result).toMatch("/fate")
  })
})

describe("presentRollName", () => {
  it("shows the name", () => {
    const roll = {name: "test", description: "a description"}

    const result = presenter.presentRollName(roll)

    expect(result).toMatch("test")
  })

  it("handles undefined name", () => {
    const roll = {description: "a description"}

    const result = presenter.presentRollName(roll)

    expect(result).not.toMatch("undefined")
  })

  it("shows the description", () => {
    const roll = {name: "test", description: "a description"}

    const result = presenter.presentRollName(roll)

    expect(result).toMatch("description")
  })

  it("handles undefined description", () => {
    const roll = {name: "test"}

    const result = presenter.presentRollName(roll)

    expect(result).not.toMatch("undefined")
  })

  it("marks incomplete", () => {
    const roll = {name: "test", description: "a description", incomplete: true}

    const result = presenter.presentRollName(roll)

    expect(result).toMatch(":warning:")
  })

  it("marks invalid", () => {
    const roll = {name: "test", description: "a description", invalid: true}

    const result = presenter.presentRollName(roll)

    expect(result).toMatch(":x:")
  })

  it("marks both invalid and incomplete", () => {
    const roll = {name: "test", description: "a description", incomplete: true, invalid: true}

    const result = presenter.presentRollName(roll)

    expect(result).toMatch(":warning:")
    expect(result).toMatch(":x:")
  })
})

describe("presentInvocation", () => {
  it("shows the command name", () => {
    const roll = {command: "nwod", options: {}}

    const result = presenter.presentInvocation(roll)

    expect(result).toMatch("nwod")
  })

  it("handles missing command name", () => {
    const roll = {options: {}}

    const result = presenter.presentInvocation(roll)

    expect(result).not.toMatch("undefined")
  })

  it("shows each option", () => {
    const roll = {command: "nwod", options: {pool: 3, until: 5, rote: true}}

    const result = presenter.presentInvocation(roll)

    expect(result).toMatch("pool")
    expect(result).toMatch("until")
    expect(result).toMatch("rote")
  })

  it("handles missing options", () => {
    const roll = {command: "nwod"}

    const result = presenter.presentInvocation(roll)

    expect(result).not.toMatch("undefined")
  })
})
