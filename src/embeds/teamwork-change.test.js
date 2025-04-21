const { i18n } = require("../locales")

const embed = require("./teamwork-change")

describe("teamwork change embed", () => {
  describe("name", () => {
    let t
    let helper

    beforeEach(() => {
      t = i18n.getFixedT("en-US", "interactive", "teamwork.embeds.change")
    })

    describe("with a non-requested helper", () => {
      beforeEach(() => {
        helper = {
          user_uid: "bob",
          requested: false,
        }
      })

      it("mentions the user", () => {
        const result = embed.name(helper, t)

        expect(result).toMatch("bob")
      })

      it("has a neutral emoji", () => {
        const result = embed.name(helper, t)

        expect(result).toMatch("➕")
      })
    })

    describe("with a requested helper", () => {
      beforeEach(() => {
        helper = {
          user_uid: "bob",
          requested: true,
        }
      })

      describe("with no dice", () => {
        beforeEach(() => {
          helper.dice = null
        })

        it("mentions the user", () => {
          const result = embed.name(helper, t)

          expect(result).toMatch("bob")
        })

        it("has a negative emoji", () => {
          const result = embed.name(helper, t)

          expect(result).toMatch("❌")
        })
      })

      describe("with some dice", () => {
        beforeEach(() => {
          helper.dice = 5
        })

        it("mentions the user", () => {
          const result = embed.name(helper, t)

          expect(result).toMatch("bob")
        })

        it("has a success emoji", () => {
          const result = embed.name(helper, t)

          expect(result).toMatch("✅")
        })
      })

      describe("with zero dice", () => {
        beforeEach(() => {
          helper.dice = 0
        })

        it("mentions the user", () => {
          const result = embed.name(helper, t)

          expect(result).toMatch("bob")
        })

        it("has a success emoji", () => {
          const result = embed.name(helper, t)

          expect(result).toMatch("✅")
        })
      })
    })
  })
})
