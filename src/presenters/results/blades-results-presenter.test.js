import { BladesPresenter } from "./blades-results-presenter"

describe("BladesPresenter", () => {
  describe("presentResults", () => {
    describe("with one roll", () => {
      const defaults = {
        rolls: 1,
        raw: [[4, 2, 6]],
        pool: 3,
        chance: false,
      }

      it("shows the description if present", () => {
        const presenter = new BladesPresenter({
          ...defaults,
          description: "just a test"
        })

        const result = presenter.presentResults()

        expect(result).toMatch("a test")
      })

      it("shows the dice pool", () => {
        const presenter = new BladesPresenter(defaults)

        const result = presenter.presentResults()

        expect(result).toMatch(("3d6"))
      })

      it("highlights the highest number", () => {
        const presenter = new BladesPresenter(defaults)

        const result = presenter.presentResults()

        expect(result).toMatch(("**6**"))
      })

      it("describes the result", () => {
        const presenter = new BladesPresenter(defaults)

        const result = presenter.presentResults()

        expect(result).toMatch(("full success"))
      })
    })

    describe("with multiple rolls", () => {
      const defaults = {
        rolls: 2,
        raw: [[4, 2, 6], [3, 1, 2]],
        pool: 3,
        chance: false,
      }

      it("shows the description if present", () => {
        const presenter = new BladesPresenter({
          ...defaults,
          description: "just a test"
        })

        const result = presenter.presentResults()

        expect(result).toMatch("a test")
      })

      it("shows the dice pool", () => {
        const presenter = new BladesPresenter(defaults)

        const result = presenter.presentResults()

        expect(result).toMatch("3d6")
      })

      it("highlights the highest number of each roll", () => {
        const presenter = new BladesPresenter(defaults)

        const result = presenter.presentResults()

        expect(result).toMatch("**6**")
        expect(result).toMatch("**3**")
      })

      it("describes each roll's result", () => {
        const presenter = new BladesPresenter(defaults)

        const result = presenter.presentResults()

        expect(result).toMatch("full success")
        expect(result).toMatch("bad outcome")
      })
    })
  })

  describe("describePool", () => {
    it("describes zero dice pool", () => {
      const presenter = new BladesPresenter({ chance: true, pool: 2 })

      const result = presenter.describePool()

      expect(result).toMatch("0 dice")
    })

    it("describes regular pools", () => {
      const presenter = new BladesPresenter({ pool: 2 })

      const result = presenter.describePool()

      expect(result).toMatch("2d6")
    })
  })

  describe("mostSignificant", () => {
    it("has two results with sixes and large pool", () => {
      const dice = [4, 5, 6, 6]
      const presenter = new BladesPresenter({ pool: 4 })

      const result = presenter.mostSignificant(dice)

      expect(result.indexes.length).toEqual(2)
    })

    it("has one result with a six and large pool", () => {
      const dice = [4, 5, 3, 6]
      const presenter = new BladesPresenter({ pool: 4 })

      const result = presenter.mostSignificant(dice)

      expect(result.indexes.length).toEqual(1)
    })

    it("has one result with six and pool 1", () => {
      const dice = [6]
      const presenter = new BladesPresenter({ pool: 1 })

      const result = presenter.mostSignificant(dice)

      expect(result.indexes.length).toEqual(1)
    })

    it("has one result with other numbers and large pool", () => {
      const dice = [4, 5, 2, 3]
      const presenter = new BladesPresenter({ pool: 4 })

      const result = presenter.mostSignificant(dice)

      expect(result.indexes.length).toEqual(1)
    })

    it("has one result in chance mode", () => {
      const dice = [2, 4]
      const presenter = new BladesPresenter({ pool: 2, chance: true })

      const result = presenter.mostSignificant(dice)

      expect(result.indexes.length).toEqual(1)
    })
  })

  describe("getResult", () => {
    it.concurrent.each([
      [[6], "full"],
      [[6, 6], "crit"],
      [[5], "partial"],
      [[4], "partial"],
      [[3], "bad"],
      [[2], "bad"],
      [[1], "bad"],
    ])("roll %s is %s result", (dice, outcome) => {
      const presenter = new BladesPresenter({ pool: dice.length })

      const result = presenter.getResult(dice)

      expect(result).toMatch(outcome)
    })
  })

  describe("detail", () => {
    it("with under six, highlights highest result", () => {
      const dice = [3, 4, 1]
      const presenter = new BladesPresenter({ rolls: 1, pool: 3 })

      const result = presenter.detail(dice)

      expect(result).toMatch("**4**")
    })

    it("with one six, highlights the six", () => {
      const dice = [3, 4, 6]
      const presenter = new BladesPresenter({ rolls: 1, pool: 3 })

      const result = presenter.detail(dice)

      expect(result).toMatch("**6**")
    })

    it("with two sixes, highlights both sixes", () => {
      const dice = [6, 4, 6]
      const presenter = new BladesPresenter({ rolls: 1, pool: 3 })

      const result = presenter.detail(dice)

      expect(result).toMatch("**6**, 4, **6**")
    })
  })
})
