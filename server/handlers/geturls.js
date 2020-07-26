/**
 * Created by zoonman on 12/11/16.
 */

const createDOMPurify = require('dompurify');
const jsdom = require('jsdom');
const window = new jsdom.JSDOM('', {
  features: {
    FetchExternalResources: false,
    ProcessExternalResources: false
  }
}
).window;

/**
 * Get links
 * @param {String} str
 * @return {Array}
 */
module.exports = function(str) {
  const DOMPurify = createDOMPurify(window);
  let links = [];
  DOMPurify.addHook('uponSanitizeElement', function(node, data) {
        if (data.tagName === 'a') {
          console.log('uponSanitizeElement', node)
          links.push(node.href);
        }
      }
  );
  DOMPurify.sanitize(str);
  return links;
};
