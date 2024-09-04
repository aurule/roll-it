/**
 * Adapted from the [docsify-code-inline](https://www.npmjs.com/package/@rakutentech/docsify-code-inline) package
 */

function transform(markdown) {
  const RE = /\[`(.*?)(?<!\\(\\{2})*)`\s+([a-z0-9-]+?)\](?!\()/g
  return markdown.replace(RE, (_, code, __, lang) => {
    const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    const langOrMarkup = Prism.languages[lang] || Prism.languages.markup
    const highlighted = Prism.highlight(escaped, langOrMarkup, lang)
    return `<code class="language-${lang}">${highlighted}</code>`
  })
}

;(function () {
  var inlinePrismPlugin = function (hook, vm) {
    hook.beforeEach((content) => transform(content))
  }

  // Add plugin to docsify's plugin array
  $docsify = $docsify || {}
  $docsify.plugins = [].concat(inlinePrismPlugin, $docsify.plugins || [])
})()
