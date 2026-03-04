import { expect } from "vitest"

import { toMatchSchema } from "./matchers/match-schema.js"
import { toHaveComponent } from "./matchers/have-component.js"
import { toHaveFlag } from "./matchers/have-flag.js"

expect.extend({
  toMatchSchema,
  toHaveComponent,
  toHaveFlag,
})
