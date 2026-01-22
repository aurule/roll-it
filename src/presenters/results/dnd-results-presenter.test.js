const { DndAttack } = require("../../util/rolls/dnd-attack")
import { i18n } from "../../locales/index.js"
const presenter = require("./dnd-results-presenter")

describe("D&D 3.5 results presenter", () => {
  describe("detail", () => {
    it("shows the rolled number", () => {
      const result = presenter.detail(10)

      expect(result).toMatch("10")
    })

    it("includes a positive modifier", () => {
      const result = presenter.detail(10, 2)

      expect(result).toMatch("+ 2")
    })

    it("includes a negative modifier", () => {
      const result = presenter.detail(10, -3)

      expect(result).toMatch("- 3")
    })
  })

  describe("skillKey", () => {
    it("returns 'bare' with no dc", () => {
      const result = presenter.skillKey(15, 0)

      expect(result).toEqual("bare")
    })

    it("returns 'pass' with result == dc", () => {
      const result = presenter.skillKey(15, 15)

      expect(result).toEqual("pass")
    })

    it("returns 'pass' with result > dc", () => {
      const result = presenter.skillKey(22, 15)

      expect(result).toEqual("pass")
    })

    it("returns 'fail' with result < dc", () => {
      const result = presenter.skillKey(10, 15)

      expect(result).toEqual("fail")
    })
  })

  describe("presentSkill", () => {
    let default_options

    describe("with one result", () => {
      beforeEach(() => {
        default_options = {
          raw: [[15]],
          rolls: 1,
          locale: "en-US",
        }
      })

      describe("with no dc", () => {
        it("shows the outcome", () => {
          const result = presenter.presentSkill({
            ...default_options,
          })

          expect(result).toMatch("**15**")
        })

        it("shows the description if given", () => {
          const result = presenter.presentSkill({
            ...default_options,
            description: "fiddle",
          })

          expect(result).toMatch("fiddle")
        })

        it("shows the modifier if given", () => {
          const result = presenter.presentSkill({
            ...default_options,
            modifier: 3,
          })

          expect(result).toMatch("+ 3")
        })
      })

      describe("with passing result", () => {
        beforeEach(() => {
          default_options.dc = 12
        })

        it("shows the outcome", () => {
          const result = presenter.presentSkill({
            ...default_options,
          })

          expect(result).toMatch("**succeeded**")
        })

        it("shows the description if given", () => {
          const result = presenter.presentSkill({
            ...default_options,
            description: "fiddle",
          })

          expect(result).toMatch("fiddle")
        })

        it("shows the modifier if given", () => {
          const result = presenter.presentSkill({
            ...default_options,
            modifier: 3,
          })

          expect(result).toMatch("+ 3")
        })
      })

      describe("with failing result", () => {
        beforeEach(() => {
          default_options.dc = 18
        })

        it("shows the outcome", () => {
          const result = presenter.presentSkill({
            ...default_options,
          })

          expect(result).toMatch("**failed**")
        })

        it("shows the description if given", () => {
          const result = presenter.presentSkill({
            ...default_options,
            description: "fiddle",
          })

          expect(result).toMatch("fiddle")
        })

        it("shows the modifier if given", () => {
          const result = presenter.presentSkill({
            ...default_options,
            modifier: 3,
          })

          expect(result).toMatch("+ 3")
        })
      })
    })

    describe("with many results", () => {
      beforeEach(() => {
        default_options = {
          raw: [[15], [4]],
          rolls: 2,
          locale: "en-US",
        }
      })

      describe("with no dc", () => {
        it("shows the description if given", () => {
          const result = presenter.presentSkill({
            ...default_options,
            description: "fiddle",
          })

          expect(result).toMatch("fiddle")
        })

        it("shows the modifier if given", () => {
          const result = presenter.presentSkill({
            ...default_options,
            modifier: 3,
          })

          expect(result).toMatch("+ 3")
        })
      })

      describe("with a dc", () => {
        beforeEach(() => {
          default_options.dc = 12
        })

        it("shows the description if given", () => {
          const result = presenter.presentSkill({
            ...default_options,
            description: "fiddle",
          })

          expect(result).toMatch("fiddle")
        })

        it("shows the dc", () => {
          const result = presenter.presentSkill({
            ...default_options,
          })

          expect(result).toMatch("DC 12")
        })

        it("shows each result", () => {
          const result = presenter.presentSkill({
            ...default_options,
          })

          expect(result).toMatch("**success**")
          expect(result).toMatch("**failure**")
        })

        it("shows the modifier if given", () => {
          const result = presenter.presentSkill({
            ...default_options,
            modifier: 3,
          })

          expect(result).toMatch("+ 3")
        })
      })
    })
  })

  describe("saveKey", () => {
    describe("with no dc", () => {
      it("returns 'autopass' when raw is 20", () => {
        const result = presenter.saveKey(20, 22)

        expect(result).toEqual("autopass")
      })

      it("returns 'autofail' when raw is 1", () => {
        const result = presenter.saveKey(1, 3)

        expect(result).toEqual("autofail")
      })

      it("returns 'num' with other raw roll", () => {
        const result = presenter.saveKey(4, 7)

        expect(result).toEqual("num")
      })
    })

    describe("with dc", () => {
      it("returns 'autopass' when raw is 20", () => {
        const result = presenter.saveKey(20, 22, 15)

        expect(result).toEqual("autopass")
      })

      it("returns 'autofail' when raw is 1", () => {
        const result = presenter.saveKey(1, 3, 15)

        expect(result).toEqual("autofail")
      })

      it("returns 'pass' when calculated is above dc", () => {
        const result = presenter.saveKey(16, 18, 15)

        expect(result).toEqual("pass")
      })

      it("returns 'pass' when calculated equals dc", () => {
        const result = presenter.saveKey(13, 15, 15)

        expect(result).toEqual("pass")
      })

      it("returns 'fail' when calculated is below dc", () => {
        const result = presenter.saveKey(10, 12, 15)

        expect(result).toEqual("fail")
      })

      it("returns 'pass' when raw is below dc and calculated is above", () => {
        const result = presenter.saveKey(10, 18, 15)

        expect(result).toEqual("pass")
      })
    })
  })

  describe("presentSave", () => {
    let default_options

    describe("with one result", () => {
      beforeEach(() => {
        default_options = {
          raw: [[15]],
          rolls: 1,
          locale: "en-US",
        }
      })

      it("shows the description if present", () => {
        const result = presenter.presentSave({
          ...default_options,
          description: "a test",
        })

        expect(result).toMatch("a test")
      })

      it("shows the modifier if present", () => {
        const result = presenter.presentSave({
          ...default_options,
          modifier: 6,
        })

        expect(result).toMatch("+ 6")
      })

      it("describes an autofail", () => {
        const result = presenter.presentSave({
          ...default_options,
          raw: [[1]],
        })

        expect(result).toMatch("natural 1")
      })

      it("describes a no-dc roll", () => {
        const result = presenter.presentSave({
          ...default_options,
        })

        expect(result).toMatch("**15**")
      })

      it("describes a success", () => {
        const result = presenter.presentSave({
          ...default_options,
          dc: 12,
        })

        expect(result).toMatch("**saved**")
      })
    })

    describe("with many results", () => {
      beforeEach(() => {
        default_options = {
          raw: [[15], [4]],
          rolls: 2,
          locale: "en-US",
        }
      })

      describe("with no dc", () => {
        it("shows the description if given", () => {
          const result = presenter.presentSave({
            ...default_options,
            description: "fiddle",
          })

          expect(result).toMatch("fiddle")
        })

        it("shows the modifier if given", () => {
          const result = presenter.presentSave({
            ...default_options,
            modifier: 3,
          })

          expect(result).toMatch("+ 3")
        })
      })

      describe("with a dc", () => {
        beforeEach(() => {
          default_options.dc = 12
        })

        it("shows the description if given", () => {
          const result = presenter.presentSave({
            ...default_options,
            description: "fiddle",
          })

          expect(result).toMatch("fiddle")
        })

        it("shows the dc", () => {
          const result = presenter.presentSave({
            ...default_options,
          })

          expect(result).toMatch("DC 12")
        })

        it("shows each result", () => {
          const result = presenter.presentSave({
            ...default_options,
          })

          expect(result).toMatch("**saved**")
          expect(result).toMatch("**failed**")
        })

        it("shows the modifier if given", () => {
          const result = presenter.presentSave({
            ...default_options,
            modifier: 3,
          })

          expect(result).toMatch("+ 3")
        })

        it("shows auto results", () => {
          const result = presenter.presentSave({
            ...default_options,
            raw: [[1], [20]],
          })

          expect(result).toMatch("natural 1")
          expect(result).toMatch("natural 20")
        })
      })
    })
  })

  describe("describeDie", () => {
    let t

    beforeEach(() => {
      t = i18n.getFixedT("en-US", "commands", "dnd.attack.result")
    })

    it("describes natural 1", () => {
      const result = presenter.describeDie(1, 6, t)

      expect(result).toMatch("natural 1")
    })

    it("describes natural 20", () => {
      const result = presenter.describeDie(20, 26, t)

      expect(result).toMatch("natural 20")
    })

    it("with another value, returns the sum", () => {
      const result = presenter.describeDie(15, 21, t)

      expect(result).toMatch("21")
    })
  })

  describe("describeCrit", () => {
    let t

    beforeEach(() => {
      t = i18n.getFixedT("en-US", "commands", "dnd.attack.result")
    })

    it("describes 20", () => {
      const result = presenter.describeCrit(20, t)

      expect(result).toMatch("crit 20")
    })

    it("describes range", () => {
      const result = presenter.describeCrit(18, t)

      expect(result).toMatch("crit 18-20")
    })

    it("describes no crit", () => {
      const result = presenter.describeCrit(0, t)

      expect(result).toMatch("no crit")
    })
  })

  describe("resolveAC", () => {
    let attack

    describe("with a nat 1 to hit", () => {
      beforeEach(() => {
        attack = new DndAttack(5, 19)
        attack.hit = 1
      })

      it("returns 'miss' when total would miss", () => {
        const result = presenter.resolveAC(attack, 24)

        expect(result).toEqual("miss")
      })

      it("returns 'miss' when total would hit", () => {
        const result = presenter.resolveAC(attack, 2)

        expect(result).toEqual("miss")
      })
    })

    describe("with a natural 20 to hit", () => {
      beforeEach(() => {
        attack = new DndAttack(5, 19)
        attack.hit = 20
      })

      it("returns 'hit.threat.crit' when confirm is a nat 20", () => {
        attack.confirm = 20

        const result = presenter.resolveAC(attack, 15)

        expect(result).toEqual("hit.threat.confirmed")
      })

      it("returns 'hit.threat.confirmed' when confirm is a nat 20, and hit total < ac", () => {
        attack.confirm = 20

        const result = presenter.resolveAC(attack, 45)

        expect(result).toEqual("hit.threat.confirmed")
      })

      it("returns 'hit.threat.denied' when confirm is a nat 1", () => {
        attack.confirm = 1

        const result = presenter.resolveAC(attack, 15)

        expect(result).toEqual("hit.threat.denied")
      })

      it("returns 'hit.threat.denied' when confirm is a nat 1, and hit total < ac", () => {
        attack.confirm = 1

        const result = presenter.resolveAC(attack, 45)

        expect(result).toEqual("hit.threat.denied")
      })

      it("returns 'hit.threat.denied' when confirm is a nat 1, and confirm total > ac", () => {
        attack.confirm = 1

        const result = presenter.resolveAC(attack, 2)

        expect(result).toEqual("hit.threat.denied")
      })

      it("returns 'hit.threat.denied' when confirm is a nat 1, and confirm total == ac", () => {
        attack.confirm = 1

        const result = presenter.resolveAC(attack, 6)

        expect(result).toEqual("hit.threat.denied")
      })

      it("returns 'hit.threat.denied' when confirm total < ac", () => {
        attack.confirm = 6

        const result = presenter.resolveAC(attack, 15)

        expect(result).toEqual("hit.threat.denied")
      })

      it("returns 'hit.threat.confirmed' when confirm total > ac", () => {
        attack.confirm = 12

        const result = presenter.resolveAC(attack, 15)

        expect(result).toEqual("hit.threat.confirmed")
      })

      it("returns 'hit.threat.confirmed' when confirm total == ac", () => {
        attack.confirm = 10

        const result = presenter.resolveAC(attack, 15)

        expect(result).toEqual("hit.threat.confirmed")
      })
    })

    describe("with hit die > 1 and < 20", () => {
      beforeEach(() => {
        attack = new DndAttack(5, 20)
      })

      describe("hit total < ac", () => {
        it("returns 'miss' on non-threat", () => {
          attack.hit = 6

          const result = presenter.resolveAC(attack, 15)

          expect(result).toEqual("miss")
        })

        it("returns 'miss' when die is a crit threat", () => {
          attack.hit = 19

          const result = presenter.resolveAC(attack, 45)

          expect(result).toEqual("miss")
        })
      })

      describe("when hit total >= ac", () => {
        it("returns 'hit.plain' when hit die < crit threshold", () => {
          attack.hit = 12

          const result = presenter.resolveAC(attack, 15)

          expect(result).toEqual("hit.plain")
        })

        describe("when hit die >= crit threshold", () => {
          beforeEach(() => {
            attack = new DndAttack(5, 19)
            attack.hit = 19
          })

          it("returns 'hit.threat.denied' when confirm is nat 1", () => {
            attack.confirm = 1

            const result = presenter.resolveAC(attack, 15)

            expect(result).toEqual("hit.threat.denied")
          })

          it("returns 'hit.threat.denied' when confirm is nat 1, and confirm total > ac", () => {
            attack.confirm = 1

            const result = presenter.resolveAC(attack, 2)

            expect(result).toEqual("hit.threat.denied")
          })

          it("returns 'hit.threat.denied' when confirm is nat 1, and confirm total == ac", () => {
            attack.confirm = 1

            const result = presenter.resolveAC(attack, 6)

            expect(result).toEqual("hit.threat.denied")
          })

          it("returns 'hit.threat.confirmed' when confirm is nat 20", () => {
            attack.confirm = 20

            const result = presenter.resolveAC(attack, 15)

            expect(result).toEqual("hit.threat.confirmed")
          })

          it("returns 'hit.threat.confirmed' when confirm total > ac", () => {
            attack.confirm = 16

            const result = presenter.resolveAC(attack, 15)

            expect(result).toEqual("hit.threat.confirmed")
          })

          it("returns 'hit.threat.confirmed' when confirm total == ac", () => {
            attack.confirm = 10

            const result = presenter.resolveAC(attack, 15)

            expect(result).toEqual("hit.threat.confirmed")
          })

          it("returns 'hit.threat.denied' when confirm total < ac", () => {
            attack.confirm = 4

            const result = presenter.resolveAC(attack, 15)

            expect(result).toEqual("hit.threat.denied")
          })
        })
      })
    })
  })

  describe("resolveAmbiguous", () => {
    describe("with a natural 20 to hit", () => {
      it("returns 'hit.threat.confirmed' with nat 20 to confirm", () => {
        const attack = new DndAttack(5, 19)
        attack.hit = 20
        attack.confirm = 20

        const result = presenter.resolveAmbiguous(attack)

        expect(result).toEqual("hit.threat.confirmed")
      })

      it("returns 'hit.threat.denied' with nat 1 to confirm", () => {
        const attack = new DndAttack(5, 19)
        attack.hit = 20
        attack.confirm = 1

        const result = presenter.resolveAmbiguous(attack)

        expect(result).toEqual("hit.threat.denied")
      })

      it("returns 'hit.threat.maybe' with other die to confirm", () => {
        const attack = new DndAttack(5, 19)
        attack.hit = 20
        attack.confirm = 15

        const result = presenter.resolveAmbiguous(attack)

        expect(result).toEqual("hit.threat.maybe")
      })
    })

    it("returns miss for nat 1", () => {
      const attack = new DndAttack(5, 20)
      attack.hit = 1

      const result = presenter.resolveAmbiguous(attack)

      expect(result).toEqual("miss")
    })

    describe("with crit 20", () => {
      it.concurrent.each(
        Array.from({ length: 18 }, (_v, k) => [k + 2]),
      )("returns 'maybe.plain' for %i", (die) => {
        const attack = new DndAttack(5, 20)
        attack.hit = die

        const result = presenter.resolveAmbiguous(attack)

        expect(result).toEqual("maybe.plain")
      })
    })

    describe("with crit 19", () => {
      it("returns 'maybe.threat.confirmed' with hit >= crit and nat 20 to confirm", () => {
        const attack = new DndAttack(5, 19)
        attack.hit = 19
        attack.confirm = 20

        const result = presenter.resolveAmbiguous(attack)

        expect(result).toEqual("maybe.threat.confirmed")
      })

      it("returns 'maybe.threat.denied' with hit >= crit and nat 1 to confirm", () => {
        const attack = new DndAttack(5, 19)
        attack.hit = 19
        attack.confirm = 1

        const result = presenter.resolveAmbiguous(attack)

        expect(result).toEqual("maybe.threat.denied")
      })

      it("returns 'maybe.threat.maybe' with hit >= crit and other number to confirm", () => {
        const attack = new DndAttack(5, 19)
        attack.hit = 19
        attack.confirm = 15

        const result = presenter.resolveAmbiguous(attack)

        expect(result).toEqual("maybe.threat.maybe")
      })
    })
  })

  describe("presentAttack", () => {
    let default_options

    beforeEach(() => {
      default_options = {
        rolls: 1,
        modifier: 5,
        crit: 20,
        attacks: [new DndAttack(5, 20)],
      }
    })

    it("shows the modifier when non-zero", () => {
      const result = presenter.presentAttack({
        ...default_options,
      })

      expect(result).toMatch("+ 5")
    })

    it("shows the modifier when zero", () => {
      const result = presenter.presentAttack({
        ...default_options,
        modifier: 0,
      })

      expect(result).toMatch("hit 0")
    })

    it("shows the crit range", () => {
      const result = presenter.presentAttack({
        ...default_options,
      })

      expect(result).toMatch("crit 20")
    })

    it("shows the description if present", () => {
      const result = presenter.presentAttack({
        ...default_options,
        description: "a test",
      })

      expect(result).toMatch("a test")
    })

    it("shows crit confirmation", () => {
      const options = {
        ...default_options,
      }
      options.attacks[0].hit = 20
      options.attacks[0]._confirm = 20

      const result = presenter.presentAttack(options)

      expect(result).toMatch("confirm")
    })

    it("shows all attacks", () => {
      const result = presenter.presentAttack({
        ...default_options,
        rolls: 2,
        attacks: [new DndAttack(5, 20), new DndAttack(5, 20)],
      })

      expect(result).toMatch("1. ")
      expect(result).toMatch("2. ")
    })
  })

  describe("presentFullAttack", () => {
    let default_options

    beforeEach(() => {
      default_options = {
        swings: 2,
        rolls: 1,
        modifier: 5,
        crit: 20,
        attacks: [
          [new DndAttack(10, 20), new DndAttack(5, 20)],
          [new DndAttack(10, 20), new DndAttack(5, 20)],
        ],
      }
    })

    it("shows the swings", () => {
      const result = presenter.presentFullAttack({
        ...default_options,
      })

      expect(result).toMatch("2 swings")
    })

    it("shows the modifier when non-zero", () => {
      const result = presenter.presentFullAttack({
        ...default_options,
      })

      expect(result).toMatch("+ 5")
    })

    it("shows the modifier when zero", () => {
      const result = presenter.presentFullAttack({
        ...default_options,
        modifier: 0,
      })

      expect(result).toMatch("hit 0")
    })

    it("shows the crit range", () => {
      const result = presenter.presentFullAttack({
        ...default_options,
      })

      expect(result).toMatch("crit 20")
    })

    it("shows the description if present", () => {
      const result = presenter.presentFullAttack({
        ...default_options,
        description: "a test",
      })

      expect(result).toMatch("a test")
    })
  })
})
