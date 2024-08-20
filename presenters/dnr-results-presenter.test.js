const { Collection } = require("discord.js")

const { DnrPresenter, DnrRollPresenter } = require("./dnr-results-presenter")

describe("DnrPresenter", () => {
  describe("mode", () => {
    it("is 'many' with rolls > 1", () => {
      options = {
        rolls: 5,
      }
      const presenter = new DnrPresenter(options)

      expect(presenter.mode).toEqual("many")
    })

    it("is 'one' with rolls = 1", () => {
      options = {
        rolls: 1,
      }
      const presenter = new DnrPresenter(options)

      expect(presenter.mode).toEqual("one")
    })
  })

  describe("presentResults", () => {
    describe("with one roll", () => {
      it.todo("includes description if present")
      it.todo("shows result")
      it.todo("shows dominant pool")
    })

    describe("with multiple rolls", () => {
      it.todo("includes description if present")
      it.todo("shows result for each roll")
      it.todo("shows dominant pool for each roll")
    })
  })

  describe("presentedDescription", () => {
    it("without description, returns empty string", () => {
      options = {}
      const presenter = new DnrPresenter(options)

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
          const presenter = new DnrPresenter(options)

          const result = presenter.presentedDescription()

          expect(result).toMatch("test description")
        })

        it("prefixes with 'for'", () => {
          options = {
            rolls: 1,
            description: "test description",
          }
          const presenter = new DnrPresenter(options)

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
          const presenter = new DnrPresenter(options)

          const result = presenter.presentedDescription()

          expect(result).toMatch("test description")
        })
      })
    })
  })

  describe("presentedTalent", () => {
    it("without talent, returns empty string", () => {
      const options = {}
      const presenter = new DnrPresenter(options)

      const result = presenter.presentedTalent()

      expect(result).toEqual("")
    })

    it("with talent, includes full talent name", () => {
      const options = {
        talent: "minor"
      }
      const presenter = new DnrPresenter(options)

      const result = presenter.presentedTalent()

      expect(result).toMatch("Minor Exhaustion")
    })
  })
})

describe("DnrRollPresenter", () => {
  describe("setDominating", () => {
    it.todo("highest die result wins")
    it.todo("largest number of dice with highest result wins")
    it.todo("next highest result wins")
    it.todo("next highest biggest pool wins")
    it.todo("total pool size wins")
    it.todo("discipline > madness > exhaustion > pain")
  })

  describe("present", () => {
    it("shows each pool's total", () => {
      const options = {
        strengths: new Collection([
          ["discipline", {name: "discipline", summed: [1], pool: 2, raw: [[3, 4]]}],
          ["exhaustion", {name: "discipline", summed: [2], pool: 2, raw: [[1, 2]]}],
          ["pain", {name: "pain", summed: [1], pool: 2, raw: [[3, 5]]}],
        ]),
      }
      const presenter = new DnrRollPresenter(options)

      const result = presenter.present()

      expect(result).toMatch("1")
      expect(result).toMatch("2")
      expect(result).toMatch("3")
    })

    it("shows the total vs pain", () => {
      const options = {
        strengths: new Collection([
          ["discipline", {name: "discipline", summed: [1], pool: 2, raw: [[3, 4]]}],
          ["exhaustion", {name: "discipline", summed: [2], pool: 2, raw: [[1, 2]]}],
          ["pain", {name: "pain", summed: [1], pool: 2, raw: [[3, 5]]}],
        ]),
      }
      const presenter = new DnrRollPresenter(options)

      const result = presenter.present()

      expect(result).toMatch("_3_ vs 1")
    })
  })

  describe("playerSubtotal", () => {
    it("does not include pain sum", () => {
      const options = {
        strengths: new Collection([
          ["discipline", {name: "discipline", summed: [2]}],
          ["pain", {name: "pain", summed: [5]}],
        ]),
      }
      const presenter = new DnrRollPresenter(options)

      expect(presenter.playerSubtotal).toEqual(2)
    })

    it("adds remaining strength sums", () => {
      const options = {
        strengths: new Collection([
          ["discipline", {name: "discipline", summed: [2]}],
          ["madness", {name: "madness", summed: [1]}],
          ["pain", {name: "pain", summed: [5]}],
        ]),
      }
      const presenter = new DnrRollPresenter(options)

      expect(presenter.playerSubtotal).toEqual(3)
    })
  })

  describe("exhaustionPool", () => {
    it("is the first sum of the pain strength", () => {
      const options = {
        strengths: new Collection([
          ["discipline", {name: "discipline", summed: [2], pool: 3}],
          ["exhaustion", {name: "discipline", summed: [2], pool: 3}],
          ["pain", {name: "pain", summed: [5]}],
        ]),
      }
      const presenter = new DnrRollPresenter(options)

      expect(presenter.exhaustionPool).toEqual(3)
    })
  })

  describe("playerTotal", () => {
    describe("with no exhaustion talent", () => {
      it("returns the subtotal", () => {
        const options = {
          strengths: new Collection([
            ["discipline", {name: "discipline", summed: [1], pool: 3}],
            ["exhaustion", {name: "exhaustion", summed: [1], pool: 3}],
            ["pain", {name: "pain", summed: [5]}],
          ]),
        }
        const presenter = new DnrRollPresenter(options)

        expect(presenter.playerTotal).toEqual(2)
      })
    })

    describe("with a minor exhaustion talent", () => {
      it("when subtotal is higher, returns subtotal", () => {
        const options = {
          talent: "minor",
          strengths: new Collection([
            ["discipline", {name: "discipline", summed: [2], pool: 3}],
            ["exhaustion", {name: "exhaustion", summed: [2], pool: 3}],
            ["pain", {name: "pain", summed: [5]}],
          ]),
        }
        const presenter = new DnrRollPresenter(options)

        expect(presenter.playerTotal).toEqual(4)
      })

      it("when exhaustion pool is higher, returns exhaustion pool", () => {
        const options = {
          talent: "minor",
          strengths: new Collection([
            ["discipline", {name: "discipline", summed: [1], pool: 3}],
            ["exhaustion", {name: "exhaustion", summed: [1], pool: 3}],
            ["pain", {name: "pain", summed: [5]}],
          ]),
        }
        const presenter = new DnrRollPresenter(options)

        expect(presenter.playerTotal).toEqual(3)
      })
    })

    describe("with a major exhaustion talent", () => {
      it("adds exhaustion pool to subtotal", () => {
        const options = {
          talent: "major",
          strengths: new Collection([
            ["discipline", {name: "discipline", summed: [2], pool: 3}],
            ["exhaustion", {name: "exhaustion", summed: [1], pool: 3}],
            ["pain", {name: "pain", summed: [5]}],
          ]),
        }
        const presenter = new DnrRollPresenter(options)

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
            ["discipline", {name: "discipline", summed: [2], pool: 3}],
            ["exhaustion", {name: "exhaustion", summed: [1], pool: 3}],
            ["pain", {name: "pain", summed: [5]}],
          ]),
        }
        const presenter = new DnrRollPresenter(options)

        expect(presenter.presentedTotal).toMatch("6")
      })

      it("shows the breakdown", () => {
        const options = {
          talent: "major",
          strengths: new Collection([
            ["discipline", {name: "discipline", summed: [2], pool: 3}],
            ["exhaustion", {name: "exhaustion", summed: [1], pool: 3}],
            ["pain", {name: "pain", summed: [5]}],
          ]),
        }
        const presenter = new DnrRollPresenter(options)

        expect(presenter.presentedTotal).toMatch("3 + 3")
      })
    })

    describe("with a minor exhaustion talent", () => {
      describe("when subtotal is higher", () => {
        it("shows the subtotal", () => {
          const options = {
            talent: "minor",
            strengths: new Collection([
              ["discipline", {name: "discipline", summed: [2], pool: 3}],
              ["exhaustion", {name: "exhaustion", summed: [2], pool: 3}],
              ["pain", {name: "pain", summed: [5]}],
            ]),
          }
          const presenter = new DnrRollPresenter(options)

          expect(presenter.presentedTotal).toMatch("4")
        })

        it("does not show the exhaustion pool", () => {
          const options = {
            talent: "minor",
            strengths: new Collection([
              ["discipline", {name: "discipline", summed: [2], pool: 3}],
              ["exhaustion", {name: "exhaustion", summed: [2], pool: 3}],
              ["pain", {name: "pain", summed: [5]}],
            ]),
          }
          const presenter = new DnrRollPresenter(options)

          expect(presenter.presentedTotal).not.toMatch("3")
        })
      })

      describe("when exhaustion pool is higher", () => {
        it("shows the subtotal struck through", () => {
          const options = {
            talent: "minor",
            strengths: new Collection([
              ["discipline", {name: "discipline", summed: [1], pool: 3}],
              ["exhaustion", {name: "exhaustion", summed: [1], pool: 3}],
              ["pain", {name: "pain", summed: [5]}],
            ]),
          }
          const presenter = new DnrRollPresenter(options)

          expect(presenter.presentedTotal).toMatch("~~2~~")
        })

        it("shows the exhaustion pool", () => {
          const options = {
            talent: "minor",
            strengths: new Collection([
              ["discipline", {name: "discipline", summed: [1], pool: 3}],
              ["exhaustion", {name: "exhaustion", summed: [1], pool: 3}],
              ["pain", {name: "pain", summed: [5]}],
            ]),
          }
          const presenter = new DnrRollPresenter(options)

          expect(presenter.presentedTotal).toMatch("3")
        })
      })
    })

    describe("with no exhaustion talent", () => {
      it("shows the subtotal", () => {
        const options = {
          strengths: new Collection([
            ["discipline", {name: "discipline", summed: [1], pool: 3}],
            ["exhaustion", {name: "exhaustion", summed: [1], pool: 3}],
            ["pain", {name: "pain", summed: [5]}],
          ]),
        }
        const presenter = new DnrRollPresenter(options)

        expect(presenter.presentedTotal).toMatch("2")
      })
    })
  })

  describe("painTotal", () => {
    it("is the first sum of the pain strength", () => {
      const options = {
        strengths: new Collection([
          ["discipline", {name: "discipline", summed: [2], pool: 3}],
          ["pain", {name: "pain", summed: [5]}],
        ]),
      }
      const presenter = new DnrRollPresenter(options)

      expect(presenter.painTotal).toEqual(5)
    })
  })

  describe("resultWord", () => {
    it("is success when total is gte pain", () => {
      const options = {
        talent: "major",
        strengths: new Collection([
          ["discipline", {name: "discipline", summed: [2], pool: 3}],
          ["exhaustion", {name: "exhaustion", summed: [1], pool: 3}],
          ["pain", {name: "pain", summed: [5]}],
        ]),
      }
      const presenter = new DnrRollPresenter(options)

      expect(presenter.resultWord).toEqual("success")
    })

    it("is failure when total is lt pain", () => {
      const options = {
        strengths: new Collection([
          ["discipline", {name: "discipline", summed: [2], pool: 3}],
          ["pain", {name: "pain", summed: [3]}],
        ]),
      }
      const presenter = new DnrRollPresenter(options)

      expect(presenter.resultWord).toEqual("failure")
    })
  })

  describe("explainStrength", () => {
    it("shows the pool's total successes", () => {
      const options = {
        strengths: new Collection([
          ["discipline", {
            name: "discipline",
            summed: [2],
            pool: 3,
            raw: [[2, 3, 4]]
          }],
          ["pain", {name: "pain", summed: [5]}],
        ]),
      }
      const presenter = new DnrRollPresenter(options)

      const result = presenter.explainStrength("discipline")

      expect(result).toMatch("2")
    })

    it("shows the name of the pool", () => {
      const options = {
        strengths: new Collection([
          ["discipline", {
            name: "discipline",
            summed: [2],
            pool: 3,
            raw: [[2, 3, 4]]
          }],
          ["pain", {name: "pain", summed: [5]}],
        ]),
      }
      const presenter = new DnrRollPresenter(options)

      const result = presenter.explainStrength("discipline")

      expect(result).toMatch("discipline")
    })

    it("highlights successful dice", () => {
      const options = {
        strengths: new Collection([
          ["discipline", {
            name: "discipline",
            summed: [2],
            pool: 3,
            raw: [[2, 3, 4]]
          }],
          ["pain", {name: "pain", summed: [5]}],
        ]),
      }
      const presenter = new DnrRollPresenter(options)

      const result = presenter.explainStrength("discipline")

      expect(result).toMatch("**2**")
      expect(result).toMatch("**3**")
    })

    describe("when dominance is from dice", () => {
      it.failing("underlines the dominant numbers", () => {
        const options = {
          strengths: new Collection([
            ["discipline", {
              name: "discipline",
              summed: [2],
              pool: 3,
              raw: [[2, 3, 5]]
            }],
            ["pain", {
              name: "pain",
              summed: [2],
              pool: 3,
              raw: [[2, 3, 4]]
            }],
          ]),
        }
        const presenter = new DnrRollPresenter(options)

        const result = presenter.explainStrength("discipline")

        expect(result).toMatch("__5__")
      })
    })

    describe("when dominance is from name", () => {
      it.failing("underlines the name", () => {
        const options = {
          strengths: new Collection([
            ["discipline", {
              name: "discipline",
              summed: [2],
              pool: 3,
              raw: [[2, 3, 5]]
            }],
            ["pain", {
              name: "pain",
              summed: [2],
              pool: 3,
              raw: [[2, 3, 5]]
            }],
          ]),
        }
        const presenter = new DnrRollPresenter(options)

        const result = presenter.explainStrength("discipline")

        expect(result).toMatch("__discipline__")
      })
    })
  })
})
