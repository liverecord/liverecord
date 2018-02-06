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
      //console.log('afterSanitizeElements');
      //console.log('node', node.nodeName);
      //console.log('outerHTML', node.outerHTML);
      if (data.tagName === 'code') {
        try {
          hljs.highlightBlock(node);
        }
        catch (e) {
          console.log('highlightBlock', e);
        }

      }
    }
);

module.exports = function(str, strict, wysiwyg) {
  wysiwyg = wysiwyg || false;
  if (strict) {
    return DOMPurify.sanitize(
        str,
        {
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

    if (wysiwyg) {
      newStr = str;
    } else {
      // identify code
      while (startIndex > -1) {
        startIndex = lcStr.indexOf('<code', pos);
        if (startIndex > -1) {
          endIndex = lcStr.indexOf('</code>', startIndex);
          if (endIndex > -1) {
            // knife party
            let codeEnd = lcStr.indexOf('>', startIndex);
            newStr += str.substr(pos, codeEnd - pos + 1);
            let strForEscaping = str
                .substr(codeEnd + 1, endIndex - codeEnd - 1);
            if (strForEscaping) {
              newStr += myEsc(strForEscaping);
            }
            newStr += '</code>';
            pos = endIndex + 7;
            //console.log('pos', pos);
          } else {
            console.log('endIndex', endIndex);
            // tag is not closed
            newStr += '</code>';
            break;
          }
        }
      }
      newStr += str.substr(pos, strLen - pos);

    }

    newStr = DOMPurify.sanitize(newStr, {
      ALLOWED_TAGS: [
        'a', 'b', 'strong', 'i', 'em', 'q', 'kbd', 'span', 'sub', 'sup', 's',
        'img', 'video',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
        'ol', 'ul', 'li',
        'p', 'br', 'blockquote', 'code', 'pre'
      ],

      ALLOWED_ATTR: [
        'lang',
        'language',
        'target',
        'href',
        'controls',
        'class',
        'alt',
        'title',
        'width',
        'height',
        'colspan',
        'rowspan',
        'src'
      ]
    }
    ).trim();
    return newStr;
  }
};
