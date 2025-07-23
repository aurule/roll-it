const { expect } = require("@jest/globals")

const { toMatchSchema } = require("./matchers/match-schema")
const { toHaveComponent } = require("./matchers/have-component")
const { toHaveFlag } = require("./matchers/have-flag")

expect.extend({
  toMatchSchema,
  toHaveComponent,
  toHaveFlag,
})
