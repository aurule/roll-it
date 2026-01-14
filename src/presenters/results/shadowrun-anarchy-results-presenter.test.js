const { ShadowrunAnarchyPresenter } = require("./shadowrun-anarchy-results-presenter")

describe("Shadowrun Anarchy presenter", () => {
  const defaults = {
    pool: 5,
    threshold: 5,
    raw: [[1, 2, 3, 4, 5]],
    summed: [1],
    risk: 0,
    rolls: 1,
    until: 0,
    description: "",
  }

  describe("presentResults", () => {
    describe("rolling until a target", () => {
      const until_defaults = {
        ...defaults,
        until: 1,
      }

      it("shows the successes for each roll", () => {
        const presenter = new ShadowrunAnarchyPresenter(until_defaults)

        const result = presenter.presentResults()

        expect(result).toMatch("- **1 success**")
      })

      it("shows the dice for each roll", () => {
        const presenter = new ShadowrunAnarchyPresenter(until_defaults)

        const result = presenter.presentResults()

        expect(result).toMatch("3, 4")
      })

      it("shows the glitch for each roll", () => {
        const presenter = new ShadowrunAnarchyPresenter({
          ...until_defaults,
          risk: 2,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("minor glitch")
      })

      it("includes the user", () => {
        const presenter = new ShadowrunAnarchyPresenter(until_defaults)

        const result = presenter.presentResults()

        expect(result).toMatch("userMention")
      })

      it("includes description if present", () => {
        const presenter = new ShadowrunAnarchyPresenter({
          ...until_defaults,
          description: "desc",
        })

        const result = presenter.presentResults()

        expect(result).toMatch("desc")
      })

      it("describes the pool", () => {
        const presenter = new ShadowrunAnarchyPresenter(until_defaults)

        const result = presenter.presentResults()

        expect(result).toMatch("5 dice")
      })

      it("describes total rolls made", () => {
        const presenter = new ShadowrunAnarchyPresenter(until_defaults)

        const result = presenter.presentResults()

        expect(result).toMatch("1 roll")
      })

      it("describes risked dice", () => {
        const presenter = new ShadowrunAnarchyPresenter({
          ...until_defaults,
          risk: 2,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("risking 2")
      })

      it("describes target", () => {
        const presenter = new ShadowrunAnarchyPresenter(until_defaults)

        const result = presenter.presentResults()

        expect(result).toMatch("until 1 success")
      })

      it("describes max rolls if given", () => {
        const presenter = new ShadowrunAnarchyPresenter({
          ...until_defaults,
          rolls: 2,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("up to 2 times")
      })
    })

    describe("with multiple rolls", () => {
      const multi_defaults = {
        ...defaults,
        raw: [
          [2, 4, 6],
          [1, 6, 5],
        ],
        summed: [1, 2],
        rolls: 2,
        pool: 3,
      }

      it("shows the successes for each roll", () => {
        const presenter = new ShadowrunAnarchyPresenter(multi_defaults)

        const result = presenter.presentResults()

        expect(result).toMatch("- **1 success**")
        expect(result).toMatch("- **2 successes**")
      })

      it("shows the dice for each roll", () => {
        const presenter = new ShadowrunAnarchyPresenter(multi_defaults)

        const result = presenter.presentResults()

        expect(result).toMatch("2, 4")
        expect(result).toMatch("1, **6**")
      })

      it("shows the glitch for each roll", () => {
        const presenter = new ShadowrunAnarchyPresenter({
          ...multi_defaults,
          risk: 2,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("minor glitch")
      })

      it("includes the user", () => {
        const presenter = new ShadowrunAnarchyPresenter(multi_defaults)

        const result = presenter.presentResults()

        expect(result).toMatch("userMention")
      })

      it("includes the description if present", () => {
        const presenter = new ShadowrunAnarchyPresenter({
          ...multi_defaults,
          description: "desc",
        })

        const result = presenter.presentResults()

        expect(result).toMatch("desc")
      })

      it("describes the pool", () => {
        const presenter = new ShadowrunAnarchyPresenter(multi_defaults)

        const result = presenter.presentResults()

        expect(result).toMatch("3 dice")
      })

      it("describes the total rolls", () => {
        const presenter = new ShadowrunAnarchyPresenter(multi_defaults)

        const result = presenter.presentResults()

        expect(result).toMatch("2 times")
      })

      it("describes risked dice", () => {
        const presenter = new ShadowrunAnarchyPresenter({
          ...multi_defaults,
          risk: 2,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("risking 2")
      })
    })

    describe("with a single roll", () => {
      it("shows the successes", () => {
        const presenter = new ShadowrunAnarchyPresenter({
          ...defaults,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("1 success")
      })

      it("shows the dice", () => {
        const presenter = new ShadowrunAnarchyPresenter({
          ...defaults,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("2, 3")
      })

      it("includes the user", () => {
        const presenter = new ShadowrunAnarchyPresenter({
          ...defaults,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("{{userMention}}")
      })

      it("includes a glitch if present", () => {
        const presenter = new ShadowrunAnarchyPresenter({
          ...defaults,
          risk: 2,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("minor glitch")
      })

      it("includes description if present", () => {
        const presenter = new ShadowrunAnarchyPresenter({
          ...defaults,
          description: "desc",
        })

        const result = presenter.presentResults()

        expect(result).toMatch("desc")
      })

      it("describes the dice pool", () => {
        const presenter = new ShadowrunAnarchyPresenter({
          ...defaults,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("5 dice")
      })

      it("describes the risked dice", () => {
        const presenter = new ShadowrunAnarchyPresenter({
          ...defaults,
          risk: 2,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("risking 2")
      })
    })
  })

  describe("explainPool", () => {
    it("shows dice total", () => {
      const presenter = new ShadowrunAnarchyPresenter({
        ...defaults,
      })

      const result = presenter.explainPool()

      expect(result).toMatch("5 dice")
    })

    it("shows risked dice", () => {
      const presenter = new ShadowrunAnarchyPresenter({
        ...defaults,
        risk: 2,
      })

      const result = presenter.explainPool()

      expect(result).toMatch("risking 2")
    })

    it("shows advantage", () => {
      const presenter = new ShadowrunAnarchyPresenter({
        ...defaults,
        threshold: 4,
      })

      const result = presenter.explainPool()

      expect(result).toMatch("with advantage")
    })

    it("shows disadvantage", () => {
      const presenter = new ShadowrunAnarchyPresenter({
        ...defaults,
        threshold: 6,
      })

      const result = presenter.explainPool()

      expect(result).toMatch("with disadvantage")
    })
  })

  describe("detail", () => {
    it("adds exclamation to success die", () => {
      const presenter = new ShadowrunAnarchyPresenter({
        ...defaults,
        raw: [[6, 1, 2, 3, 4]],
        risk: 2,
      })

      const result = presenter.detail(0)

      expect(result).toMatch("**6!**")
    })

    it("strikes glitch die", () => {
      const presenter = new ShadowrunAnarchyPresenter({
        ...defaults,
        raw: [[6, 1, 2, 3, 4]],
        risk: 2,
      })

      const result = presenter.detail(0)

      expect(result).toMatch("~~1~~")
    })

    it("includes normal die", () => {
      const presenter = new ShadowrunAnarchyPresenter({
        ...defaults,
        raw: [[6, 1, 2, 3, 4]],
        risk: 2,
      })

      const result = presenter.detail(0)

      expect(result).toMatch("3,")
    })

    it("bolds success die", () => {
      const presenter = new ShadowrunAnarchyPresenter({
        ...defaults,
        raw: [[6, 1, 2, 3, 5]],
        risk: 2,
      })

      const result = presenter.detail(0)

      expect(result).toMatch("**5**")
    })

    it("underlines risked dice", () => {
      const presenter = new ShadowrunAnarchyPresenter({
        ...defaults,
        raw: [[6, 1, 2, 3, 5]],
        risk: 2,
      })

      const result = presenter.detail(0)

      expect(result).toMatch("__**6!**, ~~1~~__")
    })

    it("does not format non-risked 1s", () => {
      const presenter = new ShadowrunAnarchyPresenter({
        ...defaults,
        raw: [[6, 1, 2, 1, 5]],
        risk: 2,
      })

      const result = presenter.detail(0)

      expect(result).toMatch("1,")
    })
  })

  describe("glitches", () => {
    it("includes 1s below the risk threshold", () => {
      const presenter = new ShadowrunAnarchyPresenter({
        ...defaults,
        raw: [[6, 1, 2, 3, 5]],
        risk: 2,
      })

      expect(presenter.glitches).toEqual([1])
    })

    it("ignores 1s after the risk threshold", () => {
      const presenter = new ShadowrunAnarchyPresenter({
        ...defaults,
        raw: [[6, 2, 2, 3, 1]],
        risk: 2,
      })

      expect(presenter.glitches).toEqual([0])
    })
  })

  describe("glitchString", () => {
    it("returns empty string with zero glitches", () => {
      const presenter = new ShadowrunAnarchyPresenter(defaults)

      const result = presenter.glitchString(0)

      expect(result).toEqual("")
    })

    it("returns minor glitch for 1", () => {
      const presenter = new ShadowrunAnarchyPresenter(defaults)

      const result = presenter.glitchString(1)

      expect(result).toMatch("minor")
    })

    it("returns major glitch for 1", () => {
      const presenter = new ShadowrunAnarchyPresenter(defaults)

      const result = presenter.glitchString(2)

      expect(result).toMatch("major")
    })

    it("returns critical glitch for 3", () => {
      const presenter = new ShadowrunAnarchyPresenter(defaults)

      const result = presenter.glitchString(3)

      expect(result).toMatch("critical")
    })

    it("returns critical glitch for above 3", () => {
      const presenter = new ShadowrunAnarchyPresenter(defaults)

      const result = presenter.glitchString(4)

      expect(result).toMatch("critical")
    })
  })
})
