/**
 * Adapted from the [docsify-code-inline](https://www.npmjs.com/package/@rakutentech/docsify-code-inline) package
 */

;(function () {
  var extendedCallouts = function (hook, vm) {
    hook.afterEach((content) => {
      const RE = /<p>(#)&gt;(.*?)<\/p>/g
      return content.replace(RE, (match, denominator, body, pos, fulltext) => {
        switch (denominator) {
          case "#":
            return `<p class="tip example">${body}</p>`
          default:
            return match
        }
      })
    })
  }

  // Add plugin to docsify's plugin array
  $docsify = $docsify || {}
  $docsify.plugins = [].concat(extendedCallouts, $docsify.plugins || [])
})()
