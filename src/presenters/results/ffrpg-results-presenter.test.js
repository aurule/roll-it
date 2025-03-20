const { FfrpgPresenter } = require("./ffrpg-results-presenter")

describe("FfrpgPresenter", () => {
  describe("presentResults", () => {
    it("includes description if present", () => {
      const presenter = new FfrpgPresenter({
        base: 60,
        raw: [[10]],
        rolls: 1,
        description: "test description"
      })

      const result = presenter.presentResults()

      expect(result).toMatch("test description")
    })

    describe("with one result", () => {
      it("shows the outcome", () => {
        const presenter = new FfrpgPresenter({
          base: 60,
          raw: [[10]],
          rolls: 1,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("critical success")
      })

      it("shows CoS modifiers", () => {
        const presenter = new FfrpgPresenter({
          base: 60,
          intrinsic: -20,
          raw: [[10]],
          rolls: 1,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("- 20 Intrinsic")
      })

      it("shows thresholds", () => {
        const presenter = new FfrpgPresenter({
          base: 60,
          crit: 20,
          raw: [[10]],
          rolls: 1,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("crit at 20")
      })
    })

    describe("with many results", () => {
      it("shows CoS modifiers", () => {
        const presenter = new FfrpgPresenter({
          base: 60,
          intrinsic: -20,
          raw: [[10], [50]],
          rolls: 2,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("- 20 Intrinsic")
      })

      it("shows thresholds", () => {
        const presenter = new FfrpgPresenter({
          base: 60,
          crit: 20,
          raw: [[10], [50]],
          rolls: 2,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("crit at 20")
      })

      it("shows each outcome", () => {
        const presenter = new FfrpgPresenter({
          base: 60,
          raw: [[10], [50]],
          rolls: 2,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("critical success")
        expect(result).toMatch("success")
      })
    })
  })

  describe("rollIsRule10", () => {
    describe("when cos is negative", () => {
      it("returns false for die < 10", () => {
        const presenter = new FfrpgPresenter({
          base: -10,
          raw: [[5]],
          rolls: 1,
        })

        const result = presenter.rollIsRule10(0)

        expect(result).toEqual(false)
      })

      it("returns false for die > 10", () => {
        const presenter = new FfrpgPresenter({
          base: -10,
          raw: [[25]],
          rolls: 1,
        })

        const result = presenter.rollIsRule10(0)

        expect(result).toEqual(false)
      })
    })

    describe("when cos is between 0 and 10", () => {
      it("returns true for cos < die < 10", () => {
        const presenter = new FfrpgPresenter({
          base: 5,
          raw: [[7]],
          rolls: 1,
        })

        const result = presenter.rollIsRule10(0)

        expect(result).toEqual(true)
      })

      it("returns false for die < cos", () => {
        const presenter = new FfrpgPresenter({
          base: 5,
          raw: [[3]],
          rolls: 1,
        })

        const result = presenter.rollIsRule10(0)

        expect(result).toEqual(false)
      })

      it("returns false for 10 < die", () => {
        const presenter = new FfrpgPresenter({
          base: 5,
          raw: [[12]],
          rolls: 1,
        })

        const result = presenter.rollIsRule10(0)

        expect(result).toEqual(false)
      })
    })
  })

  describe("rollResult", () => {
    describe("crit success", () => {
      it("when die is under CoS and crit threshold", () => {
        const presenter = new FfrpgPresenter({
          base: 60,
          raw: [[10]]
        })

        const result = presenter.rollResult(0)

        expect(result).toMatch("result.crit")
      })
    })

    describe("simple success", () => {
      it("when die is under CoS and above crit threshold", () => {
        const presenter = new FfrpgPresenter({
          base: 60,
          raw: [[40]]
        })

        const result = presenter.rollResult(0)

        expect(result).toMatch("result.simple")
      })
    })

    describe("failure", () => {
      it("when CoS is gte 10 and die is above CoS", () => {
        const presenter = new FfrpgPresenter({
          base: 60,
          raw: [[80]]
        })

        const result = presenter.rollResult(0)

        expect(result).toMatch("result.fail")
      })
    })

    describe("botch", () => {
      it("when die is above botch threshold", () => {
        const presenter = new FfrpgPresenter({
          base: 60,
          raw: [[99]]
        })

        const result = presenter.rollResult(0)

        expect(result).toMatch("result.botch")
      })
    })

    describe("rule of 10", () => {
      it("when CoS is negative and die is under 10", () => {
        const presenter = new FfrpgPresenter({
          base: -10,
          raw: [[5]]
        })

        const result = presenter.rollResult(0)

        expect(result).toMatch("result.rule10")
      })

      it("when CoS is above zero, Cos is under 10, die is greater than CoS, and die is under 10", () => {
        const presenter = new FfrpgPresenter({
          base: 2,
          raw: [[5]]
        })

        const result = presenter.rollResult(0)

        expect(result).toMatch("result.rule10")
      })
    })

    describe("desperate failure", () => {
      it("when CoS is negative and die is a normal fail", () => {
        const presenter = new FfrpgPresenter({
          base: -10,
          raw: [[15]]
        })

        const result = presenter.rollResult(0)

        expect(result).toMatch("result.desperate")
      })
    })
  })

  describe("rollDetails", () => {
    describe("when flat", () => {
      it("indicates flat", () => {
        const presenter = new FfrpgPresenter({
          base: 60,
          raw: [[20]],
          flat: true,
        })

        const result = presenter.rollDetails()

        expect(result).toMatch("flat")
      })

      it("ignores modifiers", () => {
        const presenter = new FfrpgPresenter({
          base: 60,
          intrinsic: 10,
          raw: [[20]],
          flat: true,
        })

        const result = presenter.rollDetails()

        expect(result).not.toMatch("10")
      })
    })

    it.each([
      ["intrinsic", 10],
      ["conditional", 30],
      ["avoid", 40],
    ])("shows %s bonus", (name, value) => {
      const presenter = new FfrpgPresenter({
        base: 60,
        raw: [[20]],
      })
      presenter[name] = value

      const result = presenter.rollDetails()

      expect(result).toMatch(`${value}`)
    })

    it("shows global rule10", () => {
      const presenter = new FfrpgPresenter({
        base: -10,
        raw: [[20]],
      })

      const result = presenter.rollDetails()

      expect(result).toMatch("rule of 10")
    })

    describe("with non-standard crit or botch", () => {
      it.each([
        ["crit", 20],
        ["botch", 80],
      ])("shows %s threshold", (name, value) => {
        const presenter = new FfrpgPresenter({
          base: 60,
          raw: [[20]],
        })
        presenter[name] = value

        const result = presenter.rollDetails()

        expect(result).toMatch(`${name} at ${value}`)
      })
    })

    describe("with zero crit or botch", () => {
      it.each([
        ["crit", 0],
        ["botch", 0],
      ])("shows no %s", (name, value) => {
        const presenter = new FfrpgPresenter({
          base: 60,
          raw: [[20]],
        })
        presenter[name] = value

        const result = presenter.rollDetails()

        expect(result).toMatch(`without ${name}`)
      })
    })
  })

  describe("rollMargin", () => {
    it("gives positive margin for success", () => {
      const presenter = new FfrpgPresenter({
        base: 60,
        raw: [[40]]
      })

      const result = presenter.rollMargin(0)

      expect(result).toEqual(20)
    })

    it("gives negative margin for failure", () => {
      const presenter = new FfrpgPresenter({
        base: 60,
        raw: [[70]]
      })

      const result = presenter.rollMargin(0)

      expect(result).toEqual(-10)
    })

    describe("with a negative CoS", () => {
      it("shows margin from 10", () => {
        const presenter = new FfrpgPresenter({
          base: -10,
          raw: [[20]]
        })

        const result = presenter.rollMargin(0)

        expect(result).toEqual(-10)
      })
    })

    describe("with CoS under 10, die above CoS, and die below 10", () => {
      it("shows margin from 10", () => {
        const presenter = new FfrpgPresenter({
          base: 5,
          raw: [[7]]
        })

        const result = presenter.rollMargin(0)

        expect(result).toEqual(3)
      })
    })
  })
})
