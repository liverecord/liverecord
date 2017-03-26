const ltrim = require('ltrim');

function serverName() {
  return process.env.npm_package_config_server_protocol +
      '://' +
      process.env.npm_package_config_server_name;
}

function url(pathFromRoot) {
  let pc = '/' + ltrim(pathFromRoot, '/');
  return serverName() + pc;
}

module.exports.serverName = serverName;
module.exports.url = url;
