const { roll, doRote, NwodRollOptions } = require("./nwod-roller")

describe("roll", () => {
  describe("pool", () => {
    it("result set has a length of at least pool", () => {
      const allResults = roll(new NwodRollOptions({ pool: 5, explode: 6 }))

      expect(allResults[0].length).toBeGreaterThan(4)
    })
  })

  describe("explode", () => {
    it("throws an error if explode is one", () => {
      expect(() => {
        roll(new NwodRollOptions({ pool: 5, explode: 1 }))
      }).toThrow("explode must be greater than 1")
    })

    it("adds dice as threshold is met", () => {
      const allResults = roll(new NwodRollOptions({ pool: 5, explode: 2 }))

      expect(allResults[0].length).toBeGreaterThan(5)
    })
  })

  describe("rote", () => {
    it("re-rolls failed dice from the initial pool", () => {
      const results = roll(new NwodRollOptions({
        pool: 5,
        explode: 11,
        rote: true,
        threshold: 10,
      }))

      expect(results[0].length).toBeGreaterThan(5)
    })
  })

  describe("rolls", () => {
    it("generates number of result sets equal to rolls", () => {
      const allResults = roll(new NwodRollOptions({ pool: 5, explode: 6, rolls: 3 }))

      expect(allResults.length).toEqual(3)
    })
  })

  describe("decreasing", () => {
    it("rolls fewer dice in each pool", () => {
      const allResults = roll(new NwodRollOptions({ pool: 5, explode: 11, rolls: 3, decreasing: true }))

      expect(allResults[0].length).toEqual(5)
      expect(allResults[1].length).toEqual(4)
      expect(allResults[2].length).toEqual(3)
    })
  })
})

describe("NwodRollOptions", () => {
  describe("constructor", () => {
    it.each([
      ['explode'],
      ['threshold'],
      ['chance'],
      ['rote'],
      ['rolls'],
      ['decreasing'],
    ])("sets the default %s", (attr_name) => {
      const options = new NwodRollOptions({pool: 5})

      expect(options[attr_name]).not.toBeUndefined()
    })
  })

  describe("next", () => {
    describe("flat pools", () => {
      it("leaves pool unchanged", () => {
        const options = new NwodRollOptions({pool: 5})

        options.next()

        expect(options.pool).toEqual(5)
      })
    })

    describe("with decreasing pools", () => {
      it("first roll uses original pool", () => {
        const options = new NwodRollOptions({pool: 5, decreasing: true})

        options.next()

        expect(options.pool).toEqual(5)
      })

      it("second roll uses decreased pool", () => {
        const options = new NwodRollOptions({pool: 5, decreasing: true})

        options.next()
        options.next()

        expect(options.pool).toEqual(4)
      })
    })

    describe("when pool would decrease to zero", () => {
      it("sets chance to true", () => {
        const options = new NwodRollOptions({pool: 2, decreasing: true})

        options.next()
        options.next()
        options.next()

        expect(options.chance).toBeTruthy()
      })

      it("sets explode to 10", () => {
        const options = new NwodRollOptions({pool: 2, decreasing: true})

        options.next()
        options.next()
        options.next()

        expect(options.explode).toEqual(10)
      })

      it("sets threshold to 10", () => {
        const options = new NwodRollOptions({pool: 2, decreasing: true})

        options.next()
        options.next()
        options.next()

        expect(options.threshold).toEqual(10)
      })

      it("sets pool to 1", () => {
        const options = new NwodRollOptions({pool: 2, decreasing: true})

        options.next()
        options.next()
        options.next()

        expect(options.pool).toEqual(1)
      })
    })
  })

  describe("done", () => {
    it("is false before iterations are complete", () => {
      const options = new NwodRollOptions({pool: 5, rolls: 2})

      options.next()

      expect(options.done).toBeFalsy()
    })

    it("is true when iterations are complete", () => {
      const options = new NwodRollOptions({pool: 5, rolls: 2})

      options.next()
      options.next()
      options.next()

      expect(options.done).toBeTruthy()
    })
  })

  describe("value", () => {
    it("returns index when done", () => {
      const options = new NwodRollOptions({pool: 5, rolls: 1})

      options.next()
      options.next()

      expect(options.value).toEqual(2)
    })

    it("returns roll options object while iterating", () => {
      const options = new NwodRollOptions({pool: 5, rolls: 1})

      options.next()

      expect(options.value).toMatchObject({pool: 5})
    })
  })

  describe("return", () => {
    it("allows new iteration", () => {
      const options = new NwodRollOptions({pool: 5, rolls: 2})
      options.next()
      options.next()
      options.next()

      options.return()

      expect(options.done).toBeFalsy()
    })

    it("returns done as true", () => {
      const options = new NwodRollOptions({pool: 5, rolls: 2})
      options.next()
      options.next()
      options.next()

      const result = options.return()

      expect(result.done).toBeTruthy()
    })
  })
})

describe("doRote", () => {
  describe("normal mode", () => {
    it("true when die is a fail", () => {
      const result = doRote(4, 8, false)

      expect(result).toBeTruthy()
    })

    it("false when die is a success", () => {
      const result = doRote(9, 8, false)

      expect(result).toBeFalsy()
    })
  })

  describe("chance mode", () => {
    it("false when die is a 1", () => {
      const result = doRote(1, 10, true)

      expect(result).toBeFalsy()
    })

    it("true when die is a normal failure", () => {
      const result = doRote(5, 10, true)

      expect(result).toBeTruthy()
    })

    it("true when die is 10", () => {
      const result = doRote(10, 10, true)

      expect(result).toBeTruthy()
    })
  })
})
