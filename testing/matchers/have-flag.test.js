const { expect, it, describe } = require("@jest/globals")
const { MessageFlags } = require("discord.js")

const { toHaveFlag } = require("./have-flag")

describe("toHaveFlag", () => {
  it("passes when bitfield contains the flag", () => {
    const bitfield = MessageFlags.IsComponentsV2

    const result = toHaveFlag(bitfield, MessageFlags.IsComponentsV2)

    expect(result.pass).toBe(true)
  })

  it("fails when bitfield does not contain the flag", () => {
    const bitfield = MessageFlags.IsComponentsV2

    const result = toHaveFlag(bitfield, MessageFlags.Ephemeral)

    expect(result.pass).toBe(false)
  })
})
