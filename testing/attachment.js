class Attachment {
  constructor({ contentType, contents }) {
    this.contentType = contentType
    this.contents = contents ?? ""
    this.url = ""
  }
}

module.exports = {
  Attachment,
}
