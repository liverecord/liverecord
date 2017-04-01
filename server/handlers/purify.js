/**
 * Created by zoonman on 12/11/16.
 */

const createDOMPurify = require('dompurify');
const jsdom = require('jsdom');
const window = jsdom.jsdom('', {
  features: {
    FetchExternalResources: false, // disables resource loading over HTTP /
                                   // filesystem
    ProcessExternalResources: false // do not execute JS within script
                                    // blocks
  }
}
).defaultView;
const DOMPurify = createDOMPurify(window);
const DOMPurify2 = createDOMPurify(window);
const hljs = require('highlight.js');

const escapeHtml = require('escape-html');

// Add a hook to make all links open a new window
DOMPurify.addHook('afterSanitizeAttributes', function(node) {
      // set all elements owning target to target=_blank
      if ('target' in node) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'nofollow');
      }
      // set non-HTML/MathML links to xlink:show=new
      if (!node.hasAttribute('target')
          && (node.hasAttribute('xlink:href')
          || node.hasAttribute('href'))) {
        node.setAttribute('xlink:show', 'new');
      }
    }
);

DOMPurify.addHook('uponSanitizeElement', function(node, data) {
      console.log('afterSanitizeElements');
      console.log('node', node.nodeName);
      console.log('outerHTML', node.outerHTML);
      if (data.tagName === 'code') {
        try {
          hljs.highlightBlock(node);
        }
        catch (e) {
          console.log(e);
        }

      }
      if (data.tagName === 'script') {
        //node.innerHTML = '<code>' + node.innerHTML + '</code>';
      }
    }
);

var document = window.document;
var getElementsByTagName = document.getElementsByTagName;
var DOMParser = window.DOMParser;

var _initDocument = function(dirty) {
  /* Create a HTML document using DOMParser */
  var doc, body;
  try {
    doc = new DOMParser().parseFromString(dirty, 'text/html');
  }
  catch (e) {
  }

  /* Some browsers throw, some browsers return null for the code above
   DOMParser with text/html support is only in very recent browsers.
   See #159 why the check here is extra-thorough */
  if (!doc || !doc.documentElement) {
    doc = window.document.implementation.createHTMLDocument('');
    body = doc.body;
    body.parentNode.removeChild(body.parentNode.firstElementChild);
    body.outerHTML = dirty;
  }

  /* Work on whole document or just its body */
  if (typeof doc.getElementsByTagName === 'function') {
    return doc.getElementsByTagName('body')[0];
  }
  return getElementsByTagName.call(doc, 'body')[0];
};

module.exports = function(str, strict, wysiwyg) {
  wysiwyg = wysiwyg || false;
  if (strict) {
    return DOMPurify.sanitize(str, {
          ALLOWED_TAGS: []
        }
    ).trim();
  } else {

    var lcStr = str.toLowerCase(),
        startIndex = 0,
        endIndex = 0,
        strLen = str.length,
        newStr = '',
        pos = 0;

    function myEsc(s) {
      return escapeHtml(s);
    }

    // identify code
    while (startIndex > -1) {
      startIndex = lcStr.indexOf('<code', pos);
      if (startIndex > -1) {
        endIndex = lcStr.indexOf('</code>', startIndex);
        if (endIndex > -1) {
          // knife party
          var codeEnd = lcStr.indexOf('>', startIndex);
          newStr += str.substr(pos, codeEnd - pos + 1);
          var strForEscaping = str.substr(codeEnd + 1, endIndex - codeEnd - 1);
          if (strForEscaping) {
            newStr += myEsc(strForEscaping);
          }
          newStr += '</code>';
          pos = endIndex + 7;
          console.log('pos', pos);
        } else {
          console.log('endIndex', endIndex);
          // tag is not closed
          newStr += '</code>';
          break;
        }
      }
    }
    newStr += str.substr(pos, strLen - pos);

    newStr = DOMPurify.sanitize(newStr, {
      ALLOWED_TAGS: [
        'a', 'b', 'strong', 'i', 'em', 'q', 'kbd', 'span', 'sub', 'sup', 's',
        'img', 'video',
        'ol', 'ul', 'li',
        'p', 'blockquote', 'code', 'pre'
      ],
      ADD_ATTR: [
        'controls'
      ]
    }
    ).trim();
    return newStr;
  }
};
