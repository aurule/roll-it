const { Collection } = require("discord.js")

const { DrhPool } = require("../../util/rolls/drh-pool")
const { DrhPresenter, DrhRollPresenter, DrhTeamworkPresenter } = require("./drh-results-presenter")

describe("drh results presenter", () => {
  describe("presentResults", () => {
    describe("with one roll", () => {
      it("includes description if present", () => {
        const options = {
          tests: [
            new Collection([
              ["discipline", new DrhPool("discipline", [[2, 3, 4]])],
              ["pain", new DrhPool("pain", [[6, 1]])],
            ]),
          ],
          rolls: 1,
          talent: "none",
          description: "test roll",
        }
        const presenter = new DrhPresenter(options)

        const result = presenter.presentResults()

        expect(result).toMatch("test roll")
      })

      it("shows result", () => {
        const options = {
          tests: [
            new Collection([
              ["discipline", new DrhPool("discipline", [[2, 3, 4]])],
              ["pain", new DrhPool("pain", [[6, 1]])],
            ]),
          ],
          rolls: 1,
          talent: "none",
          description: "test roll",
        }
        const presenter = new DrhPresenter(options)

        const result = presenter.presentResults()

        expect(result).toMatch("success")
        expect(result).toMatch("*2* vs 1")
      })

      it("shows dominant pool", () => {
        const options = {
          tests: [
            new Collection([
              ["discipline", new DrhPool("discipline", [[2, 3, 4]])],
              ["pain", new DrhPool("pain", [[6, 1]])],
            ]),
          ],
          rolls: 1,
          talent: "none",
          description: "test roll",
        }
        const presenter = new DrhPresenter(options)

        const result = presenter.presentResults()

        expect(result).toMatch("dominated by **pain**")
        expect(result).toMatch("__6__")
      })
    })

    describe("with multiple rolls", () => {
      it("includes description if present", () => {
        const options = {
          tests: [
            new Collection([
              ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
              ["pain", new DrhPool("pain", [[6, 1]])],
            ]),
            new Collection([
              ["discipline", new DrhPool("discipline", [[2, 3, 4]])],
              ["pain", new DrhPool("pain", [[6, 1]])],
            ]),
          ],
          rolls: 2,
          talent: "none",
          description: "test roll",
        }
        const presenter = new DrhPresenter(options)

        const result = presenter.presentResults()

        expect(result).toMatch("test roll")
      })

      it("shows result for each roll", () => {
        const options = {
          tests: [
            new Collection([
              ["discipline", new DrhPool("discipline", [[2, 3, 3]])],
              ["pain", new DrhPool("pain", [[6, 1]])],
            ]),
            new Collection([
              ["discipline", new DrhPool("discipline", [[2, 3, 4]])],
              ["pain", new DrhPool("pain", [[6, 1]])],
            ]),
          ],
          rolls: 2,
          talent: "none",
          description: "test roll",
        }
        const presenter = new DrhPresenter(options)

        const result = presenter.presentResults()

        expect(result).toMatch("*3* vs 1")
        expect(result).toMatch("*2* vs 1")
      })

      it("shows dominant pool for each roll", () => {
        const options = {
          tests: [
            new Collection([
              ["discipline", new DrhPool("discipline", [[2, 3, 6]])],
              ["pain", new DrhPool("pain", [[5, 1]])],
            ]),
            new Collection([
              ["discipline", new DrhPool("discipline", [[2, 4, 4]])],
              ["pain", new DrhPool("pain", [[5, 1]])],
            ]),
          ],
          rolls: 2,
          talent: "none",
          description: "test roll",
        }
        const presenter = new DrhPresenter(options)

        const result = presenter.presentResults()

        expect(result).toMatch("dominated by **discipline**")
        expect(result).toMatch("ominated by **pain**")
      })
    })
  })
})

describe("DrhRollPresenter", () => {
  describe("dominating strength", () => {
    it("highest die result wins", () => {
      const options = {
        strengths: new Collection([
          ["discipline", new DrhPool("discipline", [[3, 4]])],
          ["exhaustion", new DrhPool("exhaustion", [[1, 2]])],
          ["pain", new DrhPool("pain", [[3, 5]])],
        ]),
      }
      const presenter = new DrhRollPresenter(options)

      expect(presenter.dominating_strength).toEqual("pain")
      expect(presenter.dominating_feature).toEqual("5")
    })

    it("largest number of dice with highest result wins", () => {
      const options = {
        strengths: new Collection([
          ["discipline", new DrhPool("discipline", [[5, 5]])],
          ["exhaustion", new DrhPool("exhaustion", [[1, 2]])],
          ["pain", new DrhPool("pain", [[3, 5]])],
        ]),
      }
      const presenter = new DrhRollPresenter(options)

      expect(presenter.dominating_strength).toEqual("discipline")
      expect(presenter.dominating_feature).toEqual("5")
    })

    it("next highest result wins", () => {
      const options = {
        strengths: new Collection([
          ["madness", new DrhPool("madness", [[3]])],
          ["discipline", new DrhPool("discipline", [[4, 1, 5]])],
          ["pain", new DrhPool("pain", [[2, 4, 5, 3, 1]])],
          ["exhaustion", new DrhPool("exhaustion", [[4, 4]])],
        ]),
      }
      const presenter = new DrhRollPresenter(options)

      expect(presenter.dominating_strength).toEqual("pain")
      expect(presenter.dominating_feature).toEqual("3")
    })

    it("total pool size wins eventually", () => {
      const options = {
        strengths: new Collection([
          ["discipline", new DrhPool("discipline", [[2, 3, 4, 5]])],
          ["exhaustion", new DrhPool("exhaustion", [[1, 2, 3, 4, 5]])],
          ["pain", new DrhPool("pain", [[2, 3, 4, 5]])],
        ]),
      }
      const presenter = new DrhRollPresenter(options)

      expect(presenter.dominating_strength).toEqual("exhaustion")
      expect(presenter.dominating_feature).toEqual("1")
    })

    it("discipline > madness > exhaustion > pain", () => {
      const options = {
        strengths: new Collection([
          ["discipline", new DrhPool("discipline", [[2, 3, 4, 5]])],
          ["madness", new DrhPool("madness", [[1, 2, 3, 4, 5]])],
          ["exhaustion", new DrhPool("exhaustion", [[1, 2, 3, 4, 5]])],
          ["pain", new DrhPool("pain", [[1, 2, 3, 4, 5]])],
        ]),
      }
      const presenter = new DrhRollPresenter(options)

      expect(presenter.dominating_strength).toEqual("madness")
      expect(presenter.dominating_feature).toEqual("madness")
    })
  })

  describe("present", () => {
    it("shows each pool's total", () => {
      const options = {
        strengths: new Collection([
          ["discipline", new DrhPool("discipline", [[3, 4]])],
          ["exhaustion", new DrhPool("exhaustion", [[1, 2]])],
          ["pain", new DrhPool("pain", [[3, 5]])],
        ]),
      }
      const presenter = new DrhRollPresenter(options)

      const result = presenter.present()

      expect(result).toMatch("1")
      expect(result).toMatch("2")
      expect(result).toMatch("3")
    })

    it("shows the total vs pain", () => {
      const options = {
        strengths: new Collection([
          ["discipline", new DrhPool("discipline", [[3, 4]])],
          ["exhaustion", new DrhPool("exhaustion", [[1, 2]])],
          ["pain", new DrhPool("pain", [[3, 5]])],
        ]),
      }
      const presenter = new DrhRollPresenter(options)

      const result = presenter.present()

      expect(result).toMatch("*3* vs 1")
    })
  })

  describe("playerSubtotal", () => {
    it("does not include pain sum", () => {
      const options = {
        strengths: new Collection([
          ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
          ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
        ]),
      }
      const presenter = new DrhRollPresenter(options)

      expect(presenter.playerSubtotal).toEqual(2)
    })

    it("adds remaining strength sums", () => {
      const options = {
        strengths: new Collection([
          ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
          ["madness", new DrhPool("madness", [[2, 4]])],
          ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
        ]),
      }
      const presenter = new DrhRollPresenter(options)

      expect(presenter.playerSubtotal).toEqual(3)
    })
  })

  describe("exhaustionPool", () => {
    let options

    beforeEach(() => {
      options = {
        strengths: new Collection([
          ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
          ["exhaustion", new DrhPool("exhaustion", [[1, 3, 4]])],
          ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
        ]),
      }
    })

    it("is the size of the exhaustion pool", () => {
      const presenter = new DrhRollPresenter(options)

      expect(presenter.exhaustionPool).toEqual(3)
    })
  })

  describe("exhaustionValues", () => {
    let options

    beforeEach(() => {
      options = {
        strengths: new Collection([
          ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
          ["exhaustion", new DrhPool("exhaustion", [[1, 3, 4]])],
          ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
        ]),
      }
    })

    it("includes the exhaustion pool", () => {
      const presenter = new DrhRollPresenter(options)

      expect(presenter.exhaustionValues).toContain(3)
    })

    it("includes the modifier", () => {
      options.modifier = 2

      const presenter = new DrhRollPresenter(options)

      expect(presenter.exhaustionValues).toContain(2)
    })
  })

  describe("playerValues", () => {
    let options

    beforeEach(() => {
      options = {
        strengths: new Collection([
          ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
          ["exhaustion", new DrhPool("exhaustion", [[1, 3, 4]])],
          ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
        ]),
      }
    })

    it("includes the player subtotal", () => {
      const presenter = new DrhRollPresenter(options)

      expect(presenter.playerValues).toContain(4)
    })

    it("includes the modifier", () => {
      options.modifier = 1

      const presenter = new DrhRollPresenter(options)

      expect(presenter.playerValues).toContain(1)
    })

    it("with a major talent, includes the exhaustion pool", () => {
      options.talent = "major"

      const presenter = new DrhRollPresenter(options)

      expect(presenter.playerValues).toContain(3)
    })
  })

  describe("finalTotal", () => {
    describe("with no exhaustion talent", () => {
      it("returns the subtotal", () => {
        const options = {
          strengths: new Collection([
            ["discipline", new DrhPool("discipline", [[1, 4, 4]])],
            ["exhaustion", new DrhPool("exhaustion", [[1, 4, 4]])],
            ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
          ]),
        }
        const presenter = new DrhRollPresenter(options)

        expect(presenter.finalTotal).toEqual(2)
      })
    })

    describe("with a minor exhaustion talent", () => {
      it("when subtotal is higher, returns subtotal", () => {
        const options = {
          talent: "minor",
          strengths: new Collection([
            ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
            ["exhaustion", new DrhPool("exhaustion", [[1, 3, 4]])],
            ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
          ]),
        }
        const presenter = new DrhRollPresenter(options)

        expect(presenter.finalTotal).toEqual(4)
      })

      it("when exhaustion pool is higher, returns exhaustion pool", () => {
        const options = {
          talent: "minor",
          strengths: new Collection([
            ["discipline", new DrhPool("discipline", [[1, 4, 4]])],
            ["exhaustion", new DrhPool("exhaustion", [[1, 4, 4]])],
            ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
          ]),
        }
        const presenter = new DrhRollPresenter(options)

        expect(presenter.finalTotal).toEqual(3)
      })
    })

    describe("with a major exhaustion talent", () => {
      it("adds exhaustion pool to subtotal", () => {
        const options = {
          talent: "major",
          strengths: new Collection([
            ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
            ["exhaustion", new DrhPool("exhaustion", [[1, 4, 4]])],
            ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
          ]),
        }
        const presenter = new DrhRollPresenter(options)

        expect(presenter.finalTotal).toEqual(6)
      })
    })
  })

  describe("presentedTotal", () => {
    describe("with a major exhaustion talent", () => {
      let options

      beforeEach(() => {
        options = {
          talent: "major",
          strengths: new Collection([
            ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
            ["exhaustion", new DrhPool("exhaustion", [[1, 4, 4]])],
            ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
          ]),
        }
      })

      it("shows the total", () => {
        const presenter = new DrhRollPresenter(options)

        expect(presenter.presentedTotal).toMatch("6")
      })

      it("shows the breakdown", () => {
        const presenter = new DrhRollPresenter(options)

        expect(presenter.presentedTotal).toMatch("3 + 3")
      })

      it("includes modifier in breakdown", () => {
        options.modifier = 2

        const presenter = new DrhRollPresenter(options)

        expect(presenter.presentedTotal).toMatch("3 + 2 + 3")
      })
    })

    describe("with a minor exhaustion talent", () => {
      describe("when player subtotal is higher", () => {
        let options

        beforeEach(() => {
          options = {
            talent: "minor",
            strengths: new Collection([
              ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
              ["exhaustion", new DrhPool("exhaustion", [[1, 3, 4]])],
              ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
            ]),
          }
        })

        it("shows the subtotal", () => {
          const presenter = new DrhRollPresenter(options)

          expect(presenter.presentedTotal).toMatch("4")
        })

        it("does not show the exhaustion pool", () => {
          const presenter = new DrhRollPresenter(options)

          expect(presenter.presentedTotal).not.toMatch("3")
        })

        it("shows a breakdown if there's a modifier", () => {
          options.modifier = 2

          const presenter = new DrhRollPresenter(options)

          expect(presenter.presentedTotal).toMatch("4 + 2")
        })
      })

      describe("when exhaustion subtotal is higher", () => {
        let options

        beforeEach(() => {
          options = {
            talent: "minor",
            strengths: new Collection([
              ["discipline", new DrhPool("discipline", [[1, 4, 4]])],
              ["exhaustion", new DrhPool("exhaustion", [[1, 4, 4]])],
              ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
            ]),
          }
        })

        it("shows the subtotal struck through", () => {
          const presenter = new DrhRollPresenter(options)

          expect(presenter.presentedTotal).toMatch("~~2~~")
        })

        it("shows the exhaustion pool", () => {
          const presenter = new DrhRollPresenter(options)

          expect(presenter.presentedTotal).toMatch("3")
        })

        it("shows a breakdown if there's a modifier", () => {
          options.modifier = 2

          const presenter = new DrhRollPresenter(options)

          expect(presenter.presentedTotal).toMatch("3 + 2")
        })
      })
    })

    describe("with no exhaustion talent", () => {
      let options

      beforeEach(() => {
        options = {
          strengths: new Collection([
            ["discipline", new DrhPool("discipline", [[1, 4, 4]])],
            ["exhaustion", new DrhPool("exhaustion", [[1, 4, 4]])],
            ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
          ]),
        }
      })

      it("shows the subtotal", () => {
        const presenter = new DrhRollPresenter(options)

        expect(presenter.presentedTotal).toMatch("2")
      })

      it("shows a breakdown if there's a modifier", () => {
        options.modifier = 1

        const presenter = new DrhRollPresenter(options)

        expect(presenter.presentedTotal).toMatch("2 + 1")
      })
    })
  })

  describe("painTotal", () => {
    it("is the first sum of the pain strength", () => {
      const options = {
        strengths: new Collection([
          ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
          ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
        ]),
      }
      const presenter = new DrhRollPresenter(options)

      expect(presenter.painTotal).toEqual(5)
    })
  })

  describe("explainStrength", () => {
    it("shows the pool's total successes", () => {
      const options = {
        strengths: new Collection([
          ["discipline", new DrhPool("discipline", [[2, 3, 4]])],
          ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
        ]),
      }
      const presenter = new DrhRollPresenter(options)

      const result = presenter.explainStrength("discipline")

      expect(result).toMatch("2")
    })

    it("shows the name of the pool", () => {
      const options = {
        strengths: new Collection([
          ["discipline", new DrhPool("discipline", [[2, 3, 4]])],
          ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
        ]),
      }
      const presenter = new DrhRollPresenter(options)

      const result = presenter.explainStrength("discipline")

      expect(result).toMatch("discipline")
    })

    it("highlights successful dice", () => {
      const options = {
        strengths: new Collection([
          ["discipline", new DrhPool("discipline", [[2, 3, 4]])],
          ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
        ]),
      }
      const presenter = new DrhRollPresenter(options)

      const result = presenter.explainStrength("discipline")

      expect(result).toMatch("**2**")
      expect(result).toMatch("**3**")
    })

    describe("when dominance is from dice", () => {
      it("underlines the dominant numbers", () => {
        const options = {
          strengths: new Collection([
            ["discipline", new DrhPool("discipline", [[2, 3, 5]])],
            ["pain", new DrhPool("pain", [[2, 3, 4]])],
          ]),
        }
        const presenter = new DrhRollPresenter(options)

        const result = presenter.explainStrength("discipline")

        expect(result).toMatch("__5__")
      })
    })

    describe("when dominance is from name", () => {
      it("underlines the name", () => {
        const options = {
          strengths: new Collection([
            ["discipline", new DrhPool("discipline", [[2, 3, 5]])],
            ["pain", new DrhPool("pain", [[2, 3, 5]])],
          ]),
        }
        const presenter = new DrhRollPresenter(options)

        const result = presenter.explainStrength("discipline")

        expect(result).toMatch("__discipline__")
      })
    })
  })
})

describe("DrhTeamworkPresenter", () => {
  describe("presentResults", () => {
    describe("with one roll", () => {
      let options

      beforeEach(() => {
        options = {
          tests: [new Collection([["discipline", new DrhPool("discipline", [[2, 3, 4]])]])],
          rolls: 1,
        }
      })

      it("shows the total discipline successes", () => {
        const presenter = new DrhTeamworkPresenter(options)

        expect(presenter.presentResults()).toMatch("**2**")
      })

      it("shows the description if present", () => {
        options.description = "test desc"

        const presenter = new DrhTeamworkPresenter(options)

        expect(presenter.presentResults()).toMatch("test desc")
      })
    })

    describe("with multiple rolls", () => {
      let options

      beforeEach(() => {
        options = {
          tests: [
            new Collection([["discipline", new DrhPool("discipline", [[2, 3, 4]])]]),
            new Collection([["discipline", new DrhPool("discipline", [[6, 1, 5]])]]),
          ],
          rolls: 2,
        }
      })

      it("shows the total rolls", () => {
        const presenter = new DrhTeamworkPresenter(options)

        expect(presenter.presentResults()).toMatch("2 times")
      })

      it("shows the description if present", () => {
        options.description = "test desc"

        const presenter = new DrhTeamworkPresenter(options)

        expect(presenter.presentResults()).toMatch("test desc")
      })

      it("shows each result with a breakdown", () => {
        const presenter = new DrhTeamworkPresenter(options)

        expect(presenter.presentResults()).toMatch("**2** (**2**, **3**, 4)")
      })
    })
  })

  describe("resultTotal", () => {
    let options

    beforeEach(() => {
      options = {
        tests: [new Collection([["discipline", new DrhPool("discipline", [[2, 3, 4]])]])],
        rolls: 1,
      }
    })

    it("gets the total discipline successes", () => {
      const presenter = new DrhTeamworkPresenter(options)

      expect(presenter.resultTotal(0)).toEqual(2)
    })
  })

  describe("resultDetail", () => {
    let options

    beforeEach(() => {
      options = {
        tests: [new Collection([["discipline", new DrhPool("discipline", [[2, 3, 4]])]])],
        rolls: 1,
      }
    })

    it("makes a breakdown for the given roll", () => {
      const presenter = new DrhTeamworkPresenter(options)

      expect(presenter.resultDetail(0)).toEqual("**2**, **3**, 4")
    })
  })
})
