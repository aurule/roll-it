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
          description: "a test"
        })

        expect(result).toMatch("a test")
      })

      it("shows the modifier if present", () => {
        const result = presenter.presentSave({
          ...default_options,
          modifier: 6
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
})
