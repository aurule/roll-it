module.exports = {
  async fetchLines(attachment_file) {
    return fetch(attachment_file.url)
      .then((response) => response.text())
      .then((body) => body.trim().split(/\r?\n/))
  }
}
