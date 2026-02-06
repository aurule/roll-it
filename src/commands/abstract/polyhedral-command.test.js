import { Interaction } from "../../../testing/interaction.js"
import { PolyhedralCommand } from "./polyhedral-command.js"

class TestPolyhedral extends PolyhedralCommand {
  static name = "test"
  static sides = 5
}

describe("polyhedral commands", () => {
  let interaction

  beforeEach(() => {
    interaction = new Interaction()
  })

  it("rolls at or below the given sides", () => {
    interaction.command_options = {
      rolls: 100,
    }
    const poly = new TestPolyhedral(interaction)

    const result = poly.perform()

    expect(result).not.toMatch("[6]")
  })

  it("rolls at or above 1", () => {
    interaction.command_options = {
      rolls: 100,
    }
    const poly = new TestPolyhedral(interaction)

    const result = poly.perform()

    expect(result).not.toMatch("[0]")
  })

  it("adds the modifier", () => {
    interaction.command_options = {
      modifier: 10,
    }
    const poly = new TestPolyhedral(interaction)

    const result = poly.perform()

    expect(result).toMatch("+ 10")
  })

  it("rolls dice equal to pool", () => {
    interaction.command_options = {
      pool: 10,
    }
    const poly = new TestPolyhedral(interaction)

    const result = poly.perform()

    expect(result).toMatch("10d5")
  })

  it("shows description if given", () => {
    interaction.command_options = {
      description: "fiddlesticks",
    }
    const poly = new TestPolyhedral(interaction)

    const result = poly.perform()

    expect(result).toMatch("fiddlesticks")
  })
})
