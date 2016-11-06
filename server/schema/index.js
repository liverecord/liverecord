/**
 * Created by zoonman on 11/5/16.
 */

var fs = require('fs');

fs.readdirSync(__dirname).forEach(function(file) {
    if (file !== 'index.js') {
        var moduleName = file.split('.')[0];
        exports[moduleName] = require('./' + moduleName);
    }
});
