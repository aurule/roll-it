const Joi = require("joi")
const CommandHelpPresenter = require("../presenters/command-help-presenter")

const commands = require("./index")

const command_names = [...commands.keys()]
const command_schema = Joi.object({
  name: Joi.string().required(),
  data: Joi.function().required().arity(0),
  execute: Joi.function().required().arity(1),
  i18nId: Joi.string(),
  parent: Joi.string()
    .valid(...command_names)
    .invalid(Joi.ref("name"))
    .when("type", { is: "menu", then: Joi.forbidden() }),
  replacement: Joi.string()
    .valid(...command_names)
    .invalid(Joi.ref("name")),
  type: Joi.string().valid("slash", "menu"),
  policy: Joi.alternatives().try(Joi.object(), Joi.array().items(Joi.object())),
  global: Joi.boolean(),
  hidden: Joi.boolean(),
  subcommands: Joi.object(),
  savable: Joi.boolean(),
  changeable: Joi.array().items(Joi.string()),
  schema: Joi.object(),
  judge: Joi.function(),
  teamwork: Joi.object({
    roller: Joi.function().minArity(1).maxArity(2),
    summer: Joi.function().minArity(1).maxArity(2),
    presenter: Joi.function().minArity(4).maxArity(5),
  }),
  perform: Joi.function(),
  autocomplete: Joi.function().arity(1),
  help_data: Joi.function().arity(1),
}).with("savable", ["changeable", "schema"])

describe("commands", () => {
  it("loads command files", () => {
    expect(commands.size).toBeGreaterThan(0)
  })

  it("indexes commands by name", () => {
    expect(commands.get("chop").name).toEqual("chop")
  })

  it("excludes the index", () => {
    expect(commands.has(undefined)).toBeFalsy()
  })

  describe("savable collection", () => {
    it("includes savable commands", () => {
      expect(commands.savable.has("fate")).toBeTruthy()
    })
  })

  describe("global collection", () => {
    it("only includes global commands", () => {
      const global_commands = commands.global

      expect(global_commands.has("help")).toBeTruthy()
      expect(global_commands.has("fate")).toBeFalsy()
    })

    it("excludes subcommands", () => {
      const global_commands = commands.global

      expect(global_commands.has("help topic")).toBeFalsy()
    })
  })

  describe("guild collection", () => {
    it("only includes guild commands", () => {
      const guild_commands = commands.guild

      expect(guild_commands.has("help")).toBeFalsy()
      expect(guild_commands.has("fate")).toBeTruthy()
    })

    it("excludes subcommands", () => {
      const guild_commands = commands.guild

      expect(guild_commands.has("table add")).toBeFalsy()
    })
  })

  describe("deprecated collection", () => {
    it("excludes subcommands", () => {
      const deprecated_commands = commands.deprecated

      expect(deprecated_commands.has("table add")).toBeFalsy()
    })

    it.skip("includes replaced commands", () => {
      const deprecated_commands = commands.deprecated

      expect(deprecated_commands.has("chop")).toBeTruthy()
    })

    it("excludes non-replaced commands", () => {
      const deprecated_commands = commands.deprecated

      expect(deprecated_commands.has("d100")).toBeFalsy()
    })
  })

  describe("deployable collection", () => {
    it("only includes guild commands", () => {
      const deployable_commands = commands.deployable

      expect(deployable_commands.has("help")).toBeFalsy()
      expect(deployable_commands.has("fate")).toBeTruthy()
    })

    it("excludes subcommands", () => {
      const deployable_commands = commands.deployable

      expect(deployable_commands.has("table add")).toBeFalsy()
    })

    it.skip("excludes replaced commands", () => {
      const deployable_commands = commands.deployable

      expect(deployable_commands.has("chop")).toBeFalsy()
    })

    it("excludes hidden commands", () => {
      const deployable_commands = commands.deployable

      expect(deployable_commands.has("start-here")).toBeFalsy()
    })
  })

  describe("all_choices", () => {
    it("includes top-level names", () => {
      const names = commands.all_choices.map((c) => c.name)

      expect(names).toContain("coin")
    })

    it("includes subcommand names", () => {
      const names = commands.all_choices.map((c) => c.name)

      expect(names).toContain("help command")
    })
  })

  describe("sorted collections", () => {
    it("organized by locale", () => {
      expect(commands.sorted.has("en-US")).toBe(true)
    })

    it("is actually sorted", () => {
      const keys = Array.from(commands.sorted.get("en-US").keys())
      const d4_id = keys.indexOf("d4")
      const d100_id = keys.indexOf("d100")

      expect(d100_id).toBeGreaterThan(d4_id)
    })
  })

  describe("minimal command correctness", () => {
    const command_objects = Array.from(commands.entries())
    describe.each(command_objects)("`%s` command", (_name, command) => {
      describe(`replacement`, () => {
        it("when present, the replacement exists", () => {
          const replacement_name = command.replacement

          if (replacement_name) expect(commands.has(replacement_name))
        })
      })

      it("matches the command schema", () => {
        expect(command).toMatchSchema(command_schema)
      })

      describe(`data method`, () => {
        it("returns something", () => {
          const result = command.data()

          expect(result).toBeTruthy()
        })

        it("uses the command's name", () => {
          const result = command.data()

          expect(result.name).toEqual(command.name)
        })
      })

      describe(`help contents`, () => {
        it("has nothing undefined", () => {
          const result = CommandHelpPresenter.present(command, "en-US")

          expect(result).not.toMatch("{{")
        })
      })
    })
  })
})
