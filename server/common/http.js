const ltrim = require('ltrim');

function serverName() {
  return process.env.SERVER_PROTOCOL +
      '://' +
      process.env.SERVER_NAME;
}

function url(pathFromRoot) {
  let pc = '/' + ltrim(pathFromRoot, '/');
  return serverName() + pc;
}

module.exports.serverName = serverName;
module.exports.url = url;
