const { load_dir } = require("./index")

describe("data files", () => {
  describe("load_dir", () => {
    it("indexes by name", () => {
      const result = load_dir("help")

      expect(result.get("about")).toBeTruthy()
    })
  })
})
