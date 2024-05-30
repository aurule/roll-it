const commands = require("./index")

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

    describe("global collection", () => {
        it("only includes global commands", () => {
            const global_commands = commands.global()

            expect(global_commands.has("roll-help")).toBeTruthy()
            expect(global_commands.has("fate")).toBeFalsy()
        })
    })

    describe("guild collection", () => {
        it("only includes guild commands", () => {
            const guild_commands = commands.guild()

            expect(guild_commands.has("roll-help")).toBeFalsy()
            expect(guild_commands.has("fate")).toBeTruthy()
        })
    })
})
