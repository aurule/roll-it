const { expect } = require("@jest/globals")

const { toMatchSchema } = require("./matchers/match-schema")
const { toHaveComponent } = require("./matchers/have-component")

expect.extend({
  toMatchSchema,
  toHaveComponent,
})
