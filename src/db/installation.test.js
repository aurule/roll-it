const { simpleflake } = require("simpleflakes")
const { makeDB } = require("./index")
const { Installation } = require("./installation")

describe("Installation DB", () => {
  let installation
  let db

  beforeEach(() => {
    db = makeDB()
    installation = new Installation(db)
  })

  it.todo("has methods")
})
