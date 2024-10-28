const {expect} = require('@jest/globals');

const { toMatchSchema } = require('./matchers/match-schema');

expect.extend({
  toMatchSchema,
});
