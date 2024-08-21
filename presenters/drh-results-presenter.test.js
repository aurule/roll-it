const { Collection } = require("discord.js")

const { DrhPool } = require("../util/rolls/drh-pool")
const { DrhPresenter, DrhRollPresenter } = require("./drh-results-presenter")

describe("DrhPresenter", () => {
  describe("mode", () => {
    it("is 'many' with rolls > 1", () => {
      options = {
        rolls: 5,
      }
      const presenter = new DrhPresenter(options)

      expect(presenter.mode).toEqual("many")
    })

    it("is 'one' with rolls = 1", () => {
      options = {
        rolls: 1,
      }
      const presenter = new DrhPresenter(options)

      expect(presenter.mode).toEqual("one")
    })
  })

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
          talent: "",
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
          talent: "",
          description: "test roll",
        }
        const presenter = new DrhPresenter(options)

        const result = presenter.presentResults()

        expect(result).toMatch("success")
        expect(result).toMatch("_2_ vs 1")
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
          talent: "",
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
          talent: "",
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
          talent: "",
          description: "test roll",
        }
        const presenter = new DrhPresenter(options)

        const result = presenter.presentResults()

        expect(result).toMatch("_3_ vs 1")
        expect(result).toMatch("_2_ vs 1")
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
          talent: "",
          description: "test roll",
        }
        const presenter = new DrhPresenter(options)

        const result = presenter.presentResults()

        expect(result).toMatch("dominated by **discipline**")
        expect(result).toMatch("ominated by **pain**")
      })
    })
  })

  describe("presentedDescription", () => {
    it("without description, returns empty string", () => {
      options = {}
      const presenter = new DrhPresenter(options)

      const result = presenter.presentedDescription()

      expect(result).toEqual("")
    })

    describe("with a description", () => {
      describe("in single mode", () => {
        it("includes the description text", () => {
          options = {
            rolls: 1,
            description: "test description",
          }
          const presenter = new DrhPresenter(options)

          const result = presenter.presentedDescription()

          expect(result).toMatch("test description")
        })

        it("prefixes with 'for'", () => {
          options = {
            rolls: 1,
            description: "test description",
          }
          const presenter = new DrhPresenter(options)

          const result = presenter.presentedDescription()

          expect(result).toMatch("for")
        })
      })

      describe("in many mode", () => {
        it("includes the description text", () => {
          options = {
            rolls: 5,
            description: "test description",
          }
          const presenter = new DrhPresenter(options)

          const result = presenter.presentedDescription()

          expect(result).toMatch("test description")
        })
      })
    })
  })

  describe("presentedTalent", () => {
    it("without talent, returns empty string", () => {
      const options = {}
      const presenter = new DrhPresenter(options)

      const result = presenter.presentedTalent()

      expect(result).toEqual("")
    })

    it("with talent, includes full talent name", () => {
      const options = {
        talent: "minor"
      }
      const presenter = new DrhPresenter(options)

      const result = presenter.presentedTalent()

      expect(result).toMatch("Minor Exhaustion")
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

      expect(result).toMatch("_3_ vs 1")
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
    it("is the first sum of the pain strength", () => {
      const options = {
        strengths: new Collection([
          ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
          ["exhaustion", new DrhPool("exhaustion", [[1, 3, 4]])],
          ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
        ]),
      }
      const presenter = new DrhRollPresenter(options)

      expect(presenter.exhaustionPool).toEqual(3)
    })
  })

  describe("playerTotal", () => {
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

        expect(presenter.playerTotal).toEqual(2)
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

        expect(presenter.playerTotal).toEqual(4)
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

        expect(presenter.playerTotal).toEqual(3)
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

        expect(presenter.playerTotal).toEqual(6)
      })
    })
  })

  describe("presentedTotal", () => {
    describe("with a major exhaustion talent", () => {
      it("shows the total", () => {
        const options = {
          talent: "major",
          strengths: new Collection([
            ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
            ["exhaustion", new DrhPool("exhaustion", [[1, 4, 4]])],
            ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
          ]),
        }
        const presenter = new DrhRollPresenter(options)

        expect(presenter.presentedTotal).toMatch("6")
      })

      it("shows the breakdown", () => {
        const options = {
          talent: "major",
          strengths: new Collection([
            ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
            ["exhaustion", new DrhPool("exhaustion", [[1, 4, 4]])],
            ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
          ]),
        }
        const presenter = new DrhRollPresenter(options)

        expect(presenter.presentedTotal).toMatch("3 + 3")
      })
    })

    describe("with a minor exhaustion talent", () => {
      describe("when subtotal is higher", () => {
        it("shows the subtotal", () => {
          const options = {
            talent: "minor",
            strengths: new Collection([
              ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
              ["exhaustion", new DrhPool("exhaustion", [[1, 3, 4]])],
              ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
            ]),
          }
          const presenter = new DrhRollPresenter(options)

          expect(presenter.presentedTotal).toMatch("4")
        })

        it("does not show the exhaustion pool", () => {
          const options = {
            talent: "minor",
            strengths: new Collection([
              ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
              ["exhaustion", new DrhPool("exhaustion", [[1, 3, 4]])],
              ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
            ]),
          }
          const presenter = new DrhRollPresenter(options)

          expect(presenter.presentedTotal).not.toMatch("3")
        })
      })

      describe("when exhaustion pool is higher", () => {
        it("shows the subtotal struck through", () => {
          const options = {
            talent: "minor",
            strengths: new Collection([
              ["discipline", new DrhPool("discipline", [[1, 4, 4]])],
              ["exhaustion", new DrhPool("exhaustion", [[1, 4, 4]])],
              ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
            ]),
          }
          const presenter = new DrhRollPresenter(options)

          expect(presenter.presentedTotal).toMatch("~~2~~")
        })

        it("shows the exhaustion pool", () => {
          const options = {
            talent: "minor",
            strengths: new Collection([
              ["discipline", new DrhPool("discipline", [[1, 4, 4]])],
              ["exhaustion", new DrhPool("exhaustion", [[1, 4, 4]])],
              ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
            ]),
          }
          const presenter = new DrhRollPresenter(options)

          expect(presenter.presentedTotal).toMatch("3")
        })
      })
    })

    describe("with no exhaustion talent", () => {
      it("shows the subtotal", () => {
        const options = {
          strengths: new Collection([
            ["discipline", new DrhPool("discipline", [[1, 4, 4]])],
            ["exhaustion", new DrhPool("exhaustion", [[1, 4, 4]])],
            ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
          ]),
        }
        const presenter = new DrhRollPresenter(options)

        expect(presenter.presentedTotal).toMatch("2")
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

  describe("resultWord", () => {
    describe("total is equal to pain", () => {
      it("returns success", () => {
        const options = {
          talent: "major",
          strengths: new Collection([
            ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
            ["exhaustion", new DrhPool("exhaustion", [[1, 4, 4]])],
            ["pain", new DrhPool("pain", [[1, 1, 3, 5]])],
          ]),
        }
        const presenter = new DrhRollPresenter(options)

        expect(presenter.resultWord).toMatch("success")
      })
    })
    describe("total is gt pain", () => {
      it("returns success", () => {
        const options = {
          talent: "major",
          strengths: new Collection([
            ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
            ["exhaustion", new DrhPool("exhaustion", [[1, 4, 4]])],
            ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
          ]),
        }
        const presenter = new DrhRollPresenter(options)

        expect(presenter.resultWord).toMatch("success")
      })

      it("uses the degree word", () => {
        const options = {
          talent: "major",
          strengths: new Collection([
            ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
            ["exhaustion", new DrhPool("exhaustion", [[1, 4, 4]])],
            ["pain", new DrhPool("pain", [[1, 1, 1, 1, 3, 5]])],
          ]),
        }
        const presenter = new DrhRollPresenter(options)

        expect(presenter.resultWord).toMatch("competant")
      })

      it("caps degree at fantastic", () => {
        const options = {
          talent: "major",
          strengths: new Collection([
            ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
            ["exhaustion", new DrhPool("exhaustion", [[1, 4, 4]])],
            ["pain", new DrhPool("pain", [[4, 5]])],
          ]),
        }
        const presenter = new DrhRollPresenter(options)

        expect(presenter.resultWord).toMatch("fantastic")
      })
    })

    it("is failure when total is lt pain", () => {
      const options = {
        strengths: new Collection([
            ["discipline", new DrhPool("discipline", [[1, 3, 4]])],
            ["pain", new DrhPool("pain", [[1, 1, 3, 5]])],
        ]),
      }
      const presenter = new DrhRollPresenter(options)

      expect(presenter.resultWord).toEqual("failure")
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
