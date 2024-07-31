const save_roll_command = require("./save-this-roll")

describe("execute", () => {
  describe("with no incomplete roll", () => {
    it.todo("saves the command")
    it.todo("saves the options")
    it.todo("marks the record incomplete")
    it.todo("responds with instructions to finish the saved roll")
  })

  describe("with an incomplete roll", () => {
    describe("with name and description", () => {
      it.todo("saves the command")
      it.todo("saves the options")
      it.todo("marks the record complete")
      it.todo("responds with instructions to use the saved roll")
    })

    describe("with command and options", () => {
      it.todo("overwrites the command")
      it.todo("overwrites the options")
      it.todo("leaves the record incomplete")
      it.todo("responds with instructions to finish the saved roll")
    })
  })
})
