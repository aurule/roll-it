const table_manage_command = require("./manage")

describe("execute", () => {
  it.todo("warns when table is not found")
  it.todo("shows table info")
  it.todo("prompts the user with actions")

  it.todo("edit info sends a modal")
  it.todo("show contents shows full table")
  it.todo("remove table deletes the table")
})

describe("autocomplete", () => {
  it.todo("gets matching table names")
})

describe("data", () => {
  // This test is very bare-bones because we're really just
  // testing that the various calls to discord.js functions
  // were executed properly.
  it("returns something", () => {
    const command_data = table_manage_command.data()

    expect(command_data).toBeTruthy()
  })

  it("uses the command's name", () => {
    const command_data = table_manage_command.data()

    expect(command_data.name).toEqual(table_manage_command.name)
  })
})

describe("help", () => {
  it("shows some help text", () => {
    const result = table_command.help({ command_name: "/table manage"})

    expect(result).toBeTruthy()
  })
})
