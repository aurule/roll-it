vitest.mock("../util/message-builders")

import { Drh } from "./drh.js"

import { Interaction } from "../../testing/interaction.js"

describe("/drh command", () => {
  describe("schema", () => {
    describe("discipline", () => {
      const discipline_schema = Drh.schema.extract("discipline")

      it("is required", () => {
        const result = discipline_schema.validate()

        expect(result.error).toBeTruthy()
      })

      it("is an int", () => {
        const result = discipline_schema.validate(3.5)

        expect(result.error).toBeTruthy()
      })

      it("has a min of 1", () => {
        const result = discipline_schema.validate(0)

        expect(result.error).toBeTruthy()
      })

      it("has a max of 6", () => {
        const result = discipline_schema.validate(7)

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const result = discipline_schema.validate(4)

        expect(result.error).toBeFalsy()
      })
    })

    describe("pain", () => {
      const pain_schema = Drh.schema.extract("pain")

      it("is required", () => {
        const result = pain_schema.validate()

        expect(result.error).toBeTruthy()
      })

      it("is an int", () => {
        const result = pain_schema.validate(3.5)

        expect(result.error).toBeTruthy()
      })

      it("has a min of 0", () => {
        const result = pain_schema.validate(0)

        expect(result.error).toBeTruthy()
      })

      it("has a max of 100", () => {
        const result = pain_schema.validate(101)

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const result = pain_schema.validate(4)

        expect(result.error).toBeFalsy()
      })
    })

    describe("exhaustion", () => {
      it("is optional", () => {
        const options = {
          discipline: 1,
          pain: 1,
        }

        const result = Drh.schema.validate(options)

        expect(result.error).toBeFalsy()
      })

      it("is an int", () => {
        const options = {
          discipline: 1,
          pain: 1,
          exhaustion: 3.5,
        }

        const result = Drh.schema.validate(options)

        expect(result.error).toBeTruthy()
      })

      it("has a min of 1", () => {
        const options = {
          discipline: 1,
          pain: 1,
          exhaustion: 0,
        }

        const result = Drh.schema.validate(options)

        expect(result.error).toBeTruthy()
      })

      it("has a max of 6", () => {
        const options = {
          discipline: 1,
          pain: 1,
          exhaustion: 7,
        }

        const result = Drh.schema.validate(options)

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const options = {
          discipline: 1,
          pain: 1,
          exhaustion: 4,
        }

        const result = Drh.schema.validate(options)

        expect(result.error).toBeFalsy()
      })

      it("is required when talent is minor", () => {
        const options = {
          discipline: 1,
          pain: 1,
          talent: "minor",
        }

        const result = Drh.schema.validate(options)

        expect(result.error).toBeTruthy()
      })

      it("is required when talent is major", () => {
        const options = {
          discipline: 1,
          pain: 1,
          talent: "major",
        }

        const result = Drh.schema.validate(options)

        expect(result.error).toBeTruthy()
      })
    })

    describe("madness", () => {
      it("is optional", () => {
        const options = {
          discipline: 1,
          pain: 1,
        }

        const result = Drh.schema.validate(options)

        expect(result.error).toBeFalsy()
      })

      it("is an int", () => {
        const options = {
          discipline: 1,
          pain: 1,
          madness: 3.5,
        }

        const result = Drh.schema.validate(options)

        expect(result.error).toBeTruthy()
      })

      it("has a min of 1", () => {
        const options = {
          discipline: 1,
          pain: 1,
          madness: 0,
        }

        const result = Drh.schema.validate(options)

        expect(result.error).toBeTruthy()
      })

      it("has a max of 8", () => {
        const options = {
          discipline: 1,
          pain: 1,
          madness: 9,
        }

        const result = Drh.schema.validate(options)

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const options = {
          discipline: 1,
          pain: 1,
          madness: 4,
        }

        const result = Drh.schema.validate(options)

        expect(result.error).toBeFalsy()
      })

      it("is required when talent is madness", () => {
        const options = {
          discipline: 1,
          pain: 1,
          talent: "madness",
        }

        const result = Drh.schema.validate(options)

        expect(result.error).toBeTruthy()
      })
    })

    describe("talent", () => {
      const talent_schema = Drh.schema.extract("talent")

      it("is optional", () => {
        const result = talent_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it.concurrent.each([
        ["minor"],
        ["major"],
        ["madness"],
      ])("accepts %s", async (talent_value) => {
        const result = talent_schema.validate(talent_value)

        expect(result.error).toBeFalsy()
      })

      it("disallows unknown values", () => {
        const result = talent_schema.validate("other")

        expect(result.error).toBeTruthy()
      })
    })
  })

  describe("perform", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    it("rolls single result", () => {
      interaction.command_options = {
        rolls: 1,
      }
      const cmd = new Drh(interaction)

      const result = cmd.perform()

      expect(result).toMatch("rolled a")
    })

    it("rolls multiple results", () => {
      interaction.command_options = {
        rolls: 2,
      }
      const cmd = new Drh(interaction)

      const result = cmd.perform()

      expect(result).toMatch("rolled 2 times")
    })
  })

  describe("validate", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    describe("with pain zero", () => {
      beforeEach(() => {
        interaction.command_options = {
          pain: 0,
        }
      })

      it("requires talent 'none'", () => {
        interaction.command_options.talent = "minor"
        const cmd = new Drh(interaction)

        const result = cmd.validate()

        expect(result).toMatch("cannot use")
      })

      it("requires no exhaustion", () => {
        interaction.command_options.exhaustion = 3
        const cmd = new Drh(interaction)

        const result = cmd.validate()

        expect(result).toMatch("can only roll")
      })

      it("requires no madness", () => {
        interaction.command_options.madness = 3
        const cmd = new Drh(interaction)

        const result = cmd.validate()

        expect(result).toMatch("can only roll")
      })

      it("requires no modifier", () => {
        interaction.command_options.modifier = 3
        const cmd = new Drh(interaction)

        const result = cmd.validate()

        expect(result).toMatch("cannot have")
      })
    })

    it("minor talent requires exhaustion", () => {
      interaction.command_options = {
        talent: "minor",
        exhaustion: 0,
      }
      const cmd = new Drh(interaction)

      const result = cmd.validate()

      expect(result).toMatch("need at least 1 `exhaustion`")
    })

    it("major talent requires exhaustion", () => {
      interaction.command_options = {
        talent: "major",
        exhaustion: 0,
      }
      const cmd = new Drh(interaction)

      const result = cmd.validate()

      expect(result).toMatch("need at least 1 `exhaustion`")
    })

    it("madness talent requires madness dice", () => {
      interaction.command_options = {
        talent: "madness",
        madness: 0,
      }
      const cmd = new Drh(interaction)

      const result = cmd.validate()

      expect(result).toMatch("need at least 1 `madness`")
    })
  })
})
