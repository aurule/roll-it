import { DndAttack } from "./dnd-attack.js"

describe("DndAttack object", () => {
  it("stores the modifier", () => {
    const attack = new DndAttack(9, 20)

    expect(attack.modifier).toEqual(9)
  })

  it("stores the crit", () => {
    const attack = new DndAttack(9, 19)

    expect(attack.crit).toEqual(19)
  })

  it("rolls to hit", () => {
    const attack = new DndAttack(9, 19)

    expect(attack.hit).not.toBeUndefined()
  })

  it("sets the hit total", () => {
    const attack = new DndAttack(9, 19)

    expect(attack.hit_total).not.toBeUndefined()
  })

  describe("confirm", () => {
    it("with a crit threat, has a positive value", () => {
      const attack = new DndAttack(9, 19)
      attack.hit = 20

      expect(attack.confirm).toBeGreaterThan(0)
    })

    it("with a non-crit, confirm is zero", () => {
      const attack = new DndAttack(9, 19)
      attack.hit = 2

      expect(attack.confirm).toEqual(0)
    })
  })

  describe("confirm total", () => {
    it("with a confirmation roll, confirm total > 0", () => {
      const attack = new DndAttack(9, 19)
      attack.hit = 20

      expect(attack.confirm_total).toBeGreaterThan(0)
    })

    it("without confirmation roll, confirm total === 0", () => {
      const attack = new DndAttack(9, 19)
      attack.hit = 14

      expect(attack.confirm_total).toBe(0)
    })
  })
})
