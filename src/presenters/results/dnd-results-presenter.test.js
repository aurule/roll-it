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
            description: "fiddle"
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
            description: "fiddle"
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
            description: "fiddle"
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
            description: "fiddle"
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
            description: "fiddle"
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
            modifier: 3
          })

          expect(result).toMatch("+ 3")
        })
      })
    })
  })
})
