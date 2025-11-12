jest.mock("../util/message-builders")

const paginate = require("./paginate")

const { CommandInteraction, MessageFlags } = require("discord.js")

class PatchMePaginate {
  messages = []
  replied = false

  async reply(args) {
    if (this.replied) throw new Error("already replied")
    this.messages.push(args)
    this.replied = true
    return args
  }

  async followUp(args) {
    if (!this.replied) throw new Error("not yet replied")
    this.messages.push(args)
    return args
  }
}

describe("Paginator class", () => {
  describe("constructor", () => {
    it("sets the page length for locale", () => {
      const paginator = new paginate.Paginator("stuff")

      expect(paginator.page_length).toBeLessThan(paginator.max_characters)
    })
  })

  describe("prefix", () => {
    it("gives first page prefix", () => {
      const paginator = new paginate.Paginator("stuff")

      expect(paginator.prefix(1)).toEqual("")
    })

    it("gives other page prefix", () => {
      const paginator = new paginate.Paginator("stuff")

      expect(paginator.prefix(2)).toEqual("…")
    })
  })

  describe("suffix", () => {
    let paginator

    beforeEach(() => {
      paginator = new paginate.Paginator("rocks and trees and trees and rocks", 30)
    })

    it("gives first page suffix", () => {
      expect(paginator.suffix(1)).toEqual("…\n-# (message 1/4)")
    })

    it("gives second page suffix", () => {
      expect(paginator.suffix(2)).toEqual("…\n-# (message 2/4)")
    })

    it("gives last page suffix", () => {
      expect(paginator.suffix(4)).toEqual("\n-# (message 4/4)")
    })
  })

  describe("newlines", () => {
    it("returns all newline indexes", () => {
      const paginator = new paginate.Paginator("rocks and trees\nand trees\nand rocks")

      expect(paginator.newlines).toEqual([15, 25])
    })
  })

  describe("invalid_ranges", () => {
    it("returns an array of invalid range sets", () => {
      const paginator = new paginate.Paginator("rocks and trees *and trees* and rocks")

      expect(paginator.invalid_ranges).toEqual([[16, 27]])
    })

    it("handles multiple ranges", () => {
      const paginator = new paginate.Paginator("__rocks__ and trees *and trees* and rocks")

      expect(paginator.invalid_ranges).toEqual([[20, 31], [0, 9]])
    })
  })

  describe("breakpoint_is_valid", () => {
    it("returns true when breakpoint is outside of all invalid ranges", () => {
      const paginator = new paginate.Paginator("__rocks__ and trees *and trees* and rocks")

      const result = paginator.breakpoint_is_valid(12)

      expect(result).toBe(true)
    })

    it("returns false when breakpoint is within an invalid range", () => {
      const paginator = new paginate.Paginator("__rocks__ and trees *and trees* and rocks")

      const result = paginator.breakpoint_is_valid(22)

      expect(result).toBe(false)
    })
  })

  describe("segments", () => {
    it("finds word boundaries", () => {
      const paginator = new paginate.Paginator("rocks and trees and trees and rocks")

      const result = paginator.segments

      expect(result).toContain(10)
    })

    it("omits boundaries within an invalid range", () => {
      const paginator = new paginate.Paginator("__rocks__ and trees *and trees* and rocks")

      const result = paginator.segments

      expect(result).not.toContain(25)
      expect(result).toContain(36)
    })
  })

  describe("messages", () => {
    let paginator
    let original

    describe("with a single page", () => {
      beforeEach(() => {
        original = "rocks and trees and trees and rocks"
        paginator = new paginate.Paginator(original, 100)
      })

      it("returns an array with one message", () => {
        const result = paginator.messages()

        expect(result[0]).toEqual(original)
      })
    })

    describe("with multiple pages", () => {
      describe("when text has newlines within the margin", () => {
        beforeEach(() => {
          original = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Pellentesque lacinia magna in aliquam elementum.
Donec quis justo et lectus rutrum accumsan.
Vivamus at felis in massa feugiat accumsan.

Curabitur placerat quam eu tortor pellentesque, vitae vestibulum libero placerat.
Nunc nec quam at sapien dapibus consequat ac nec neque.
Nullam ornare ipsum in velit pellentesque, ac iaculis magna laoreet.
Nam convallis tellus venenatis, pharetra felis ac, gravida elit.
Morbi tempus quam a justo dapibus pellentesque.

Vivamus eu mi vitae lacus eleifend euismod ac eu ipsum.
Mauris non dolor malesuada, semper magna non, sagittis dui.
Aliquam auctor lorem eu nisi pulvinar, non pellentesque risus cursus.
Suspendisse sed nibh ultricies, scelerisque dolor ullamcorper, maximus ligula.

Proin gravida quam at risus eleifend, eu blandit nisi rutrum.
Curabitur pharetra justo non dolor sagittis gravida.
Etiam consectetur quam quis nunc dapibus blandit.
Curabitur facilisis purus at venenatis imperdiet.

Sed eget nisi non ante pellentesque pretium in vitae diam.
Mauris pulvinar massa quis nulla condimentum luctus.
Maecenas malesuada diam in arcu mattis, sed varius justo tristique.
`
        paginator = new paginate.Paginator(original, 500)
        })

        it("returns all pages", () => {
          const result = paginator.messages()

          expect(result.length).toBeGreaterThan(1)
        })

        it("breaks on newlines", () => {
          const result = paginator.messages()

          expect(result[1]).toMatch(/^…Morbi/)
        })

        it("removes that newline", () => {
          const result = paginator.messages()

          expect(result[1]).not.toMatch(/^…\n/)
        })

        it("avoids truncating the final message", () => {
          const result = paginator.messages()

          expect(result[2]).toMatch(/tristique\./)
        })
      })

      describe("when text has no convenient newlines", () => {
        beforeEach(() => {
          original = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam fermentum pretium sollicitudin. Mauris in finibus lacus, eu faucibus ex. Vestibulum tempor odio enim, non ullamcorper nisi convallis id. Nam sodales varius accumsan. Cras vehicula elit tellus, id convallis libero imperdiet quis. Nulla viverra lacus eu tellus tempor interdum. Integer fermentum metus pharetra tortor aliquet pharetra. In at est mauris. Duis non rutrum diam, sed ornare nulla. Praesent fermentum nunc odio, id dignissim ligula malesuada in. Curabitur at leo venenatis, ultrices risus eu, fringilla elit. Etiam ac nisi leo.

Etiam vehicula ante eget nulla pharetra, eget dignissim sem dictum. Proin finibus arcu lectus. Proin eget elit sed nunc blandit condimentum. Proin sollicitudin quam sed nulla sodales, in ullamcorper sapien porttitor. Suspendisse sit amet aliquet nibh, sed varius eros. Ut elementum orci massa, vitae egestas risus lacinia eu. Nunc cursus, ex *id malesuada fermentum*, leo arcu luctus metus, eu condimentum neque ante vitae sem. Proin eros nunc, vestibulum quis blandit eu, porttitor et justo. Aliquam non lacus dictum, laoreet odio et, dignissim turpis. Donec commodo maximus diam, tempus ultricies elit iaculis vitae. Praesent efficitur sollicitudin lectus, vel scelerisque tellus imperdiet vel. Duis dictum, nisl quis ullamcorper congue, purus diam rhoncus ipsum, ut pretium tellus odio sit amet tellus. In in velit neque. Nam lacinia feugiat facilisis.
`
          paginator = new paginate.Paginator(original, 500)
        })

        it("returns all pages", () => {
          const result = paginator.messages()

          expect(result.length).toBeGreaterThan(1)
        })

        it("breaks on words", () => {
          const result = paginator.messages()

          expect(result[1]).toMatch(/^…nunc/)
        })

        it("does not break within formatting", () => {
          const result = paginator.messages()

          expect(result[2]).toMatch(/^…ex/)
        })
      })
    })
  })
})

describe("pagination helper", () => {
  describe("patch", () => {
    it("targets the base command class by default", () => {
      paginate.patch()

      expect(CommandInteraction.prototype.paginate).not.toBeUndefined()
    })
  })

  describe("paginate", () => {
    beforeAll(() => {
      paginate.patch(PatchMePaginate)
    })

    describe("with a short message", () => {
      it("sends one reply", async () => {
        const fake = new PatchMePaginate()

        await fake.paginate({
          content: "I am surprisingly short, actually.",
          max_length: 100,
        })

        expect(fake.messages.length).toEqual(1)
      })

      it("sends ephemeral if given", async () => {
        const fake = new PatchMePaginate()

        await fake.paginate({
          content: "I am surprisingly short, actually.",
          max_length: 100,
          secret: true,
        })

        expect(fake.messages[0].flags).toHaveFlag(MessageFlags.Ephemeral)
      })
    })

    describe("with a long message", () => {
      it("sends multiple replies", async () => {
        const fake = new PatchMePaginate()

        await fake.paginate({
          content:
            "I am surprisingly long, actually. I know, it's a real surprise, but truly I have over 100 characters!",
          max_length: 100,
        })

        expect(fake.messages.length).toEqual(2)
      })

      it("sends ephemeral on each message", async () => {
        const fake = new PatchMePaginate()

        await fake.paginate({
          content:
            "I am surprisingly long, actually. I know, it's a real surprise, but truly I have over 100 characters!",
          max_length: 100,
          secret: true,
        })

        expect(fake.messages[0].flags).toHaveFlag(MessageFlags.Ephemeral)
        expect(fake.messages[1].flags).toHaveFlag(MessageFlags.Ephemeral)
      })
    })
  })
})
