/**
 * Created by zoonman on 2/4/17.
 */

const xtend = require('xtend');
const fs = require('fs');
const errorHandler = require('./errors');
const purify = require('./purify');

/**
 * Easy escape
 * @param  {string} html
 * @return {string}
 */


function ee(html) {
  html = purify(html, true);
  return String(html)
      .replace(/&(?!\w+;)/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/"/g, '&quot;');
}

function modifyBody(inputString, options) {

  options = xtend({
    title: '',
    frontLiveRecordConfig: {version: '1'},
    description: '',
    keywords: []
  }, options);

  if (options.frontLiveRecordConfig.version) {
    inputString = inputString.replace(
        /\/main\.1\./g,
        '/main.' + options.frontLiveRecordConfig.version + '.'
        );
    inputString = inputString.replace('liveRecordConfig = {}',
        'liveRecordConfig = ' + JSON.stringify(options.frontLiveRecordConfig)
        );
  }

  if (options.title) {
    inputString = inputString.replace(
        '<title></title>',
        '<title>' + ee(options.title) + '</title>'
        );
  }

  if (options.description) {
    inputString = inputString.replace(
        '<meta name="description" content="">',
        '<meta name="description" content="' + ee(options.description.substr(
            0,
            250
        ).replace(/\n/g, ' ')) + '">'
        );
  }

  if (options.keywords) {
    inputString = inputString.replace(
        '<meta name="keywords" content="">',
        '<meta name="keywords" content="' + ee(options.keywords.join(', ')) +
        '">'
        );
  }

  return inputString;
}

function sendResponse(res, html, code) {
  'use strict';
  code = code || 200;
  html = html || '';
  res.writeHead(code, {
        'Content-Type': 'text/html;encoding: utf-8'
      }
  );
  res.write(html);
  res.end();
}

function expressRouter(req, res, next) {
  var modifyBodyFunction = function(inputStr) {
    return modifyBody(inputStr, {
      title: 'Форум про Линукс и свободные программы',
      description: 'Общайся легко и свободно на нашем живом форуме.',
      keywords: ['Linux, СПО, форум, чат, обсуждения, дискуссии'],
      frontLiveRecordConfig: req.app.get('frontLiveRecordConfig')
    });
  };
  serveIndex(res, modifyBodyFunction);
}

function serveIndex(res, modifyBodyFunction, code) {
  fs.readFile(__dirname + '/../public/index.html',
      'utf8',
      function(err, indexData) {
        if (err) {
          sendResponse(res, 'Internal server error', 502);
          return errorHandler(err);
        }
        if (modifyBodyFunction) {
          indexData = modifyBodyFunction(indexData);
        }
        sendResponse(res, indexData, code);
      }
  );
}

module.exports.modifyBody = modifyBody;
module.exports.sendResponse = sendResponse;
module.exports.expressRouter = expressRouter;
module.exports.serveIndex = serveIndex;
module.exports.easyEscape = ee;
