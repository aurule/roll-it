const Participant = require("./participant")
const Test = require("./met-test")
const Retest = require("./retest")

const TestRecorder = require("./test-recorder")

describe("TestRecorder", () => {
  let attacker
  let defender

  beforeEach(() => {
    attacker = new Participant("attacker")
    defender = new Participant("defender")
  })

  it("saves attacker", () => {
    const recorder = new TestRecorder(attacker, defender)

    expect(recorder.attacker).toBe(attacker)
  })

  it("saves defender", () => {
    const recorder = new TestRecorder(attacker, defender)

    expect(recorder.defender).toBe(defender)
  })

  describe("addTest", () => {
    it("adds a new test record", () => {
      const recorder = new TestRecorder(attacker, defender)

      const result = recorder.addTest()

      expect(result).toEqual(expect.any(Test))
    })
  })

  describe("addRetest", () => {
    it("adds a new retest record", () => {
      const recorder = new TestRecorder(attacker, defender)
      recorder.addTest()

      const result = recorder.addRetest(attacker, "ability")

      expect(result).toEqual(expect.any(Retest))
    })
  })
})
