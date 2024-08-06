const { added } = require("./addition-presenter")

it("renders positive addition", () => {
    const result = added(5)

    expect(result).toMatch(" + 5")
})

it("renders negative addition", () => {
    const result = added(-5)

    expect(result).toMatch(" - 5")
})

it("ignores zero", () => {
    const result = added(0)

    expect(result).toMatch("")
})
