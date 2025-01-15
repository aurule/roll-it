const { Collection } = require("discord.js")
const Presenter = require("./topic-name-presenter")

const test_topic = {
  name: "test",
  title: "A Test Topic",
  description: "A topic to test to",
}

describe("list", () => {
  it("shows the topic names", () => {
    const topics = new Collection([[test_topic.name, test_topic]])

    const result = Presenter.list(topics)

    const joined = result.join("\n")
    expect(joined).toMatch(test_topic.name)
  })

  it("shows the topic descriptions", () => {
    const topics = new Collection([[test_topic.name, test_topic]])

    const result = Presenter.list(topics)

    const joined = result.join("\n")
    expect(joined).toMatch(test_topic.description)
  })
})
