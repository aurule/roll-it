class Attachment {
  constructor({ contentType, contents, size }) {
    this.contentType = contentType
    this.contents = contents ?? ""
    this.url = ""
    this.size = size ?? contents.length
  }
}

module.exports = {
  Attachment,
}
