jest.mock("../util/message-builders")

const Joi = require("joi")

const install_handler = require("./installation")

const install_component_schema = Joi.object({
  name: Joi.string().required(),
  valid_states: Joi.array()
    .required()
    .min(1),
    // .items(Joi.string().valid(...Object.values(Challenge.States))),
  data: Joi.function().required(),
  execute: Joi.function().required().arity(1),
}).unknown()

describe("install component correctness", () => {
  it.concurrent.each(
    Array.from(install_handler.components.entries()),
  )("`%s` component matches the schema", (_name, component) => {
    expect(component).toMatchSchema(install_component_schema)
  })
})

describe("installation component handler", () => {
  describe("canHandle", () => {
    it("returns true when customId matches an installation component", () => {
      const result = install_handler.canHandle({ customId: "install_cancel" })

      expect(result).toBe(true)
    })

    it("returns false when customId does not match an installation component", () => {
      const result = install_handler.canHandle({ customId: "nope" })

      expect(result).toBe(false)
    })
  })

  describe("handle", () => {
    let interaction

    it.todo("TBD")
  })
})
