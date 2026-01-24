import { expect, it, describe } from "@jest/globals"
import { MessageFlags } from "discord.js"

import { toHaveFlag } from "./have-flag.js"

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
