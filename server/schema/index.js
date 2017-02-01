/**
 * Created by zoonman on 11/5/16.
 */

const fs = require('fs');

fs.readdirSync(__dirname).forEach(function(file) {
  if (file !== 'index.js') {
    const moduleName = file.split('.')[0];
    exports[moduleName] = require('./' + moduleName);
  }
});
