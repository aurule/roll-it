const { load_dir, help_topics } = require("./index")

describe("load_dir", () => {
  it("indexes by name", () => {
    const result = load_dir("help")

    expect(result.get("about")).toBeTruthy()
  })
})
