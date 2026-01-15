/**
 * Create an array of lines from a remote file's contents
 *
 * @param  {obj}   attachment_file Discord uploaded file object
 * @return {Promise<str[]>}        Array of strings, one per line in the file's body
 */
export async function fetchLines(attachment_file) {
  return fetch(attachment_file.url)
    .then((response) => response.text())
    .then((body) => body.trim().split(/\r?\n/))
}
