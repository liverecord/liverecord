/**
 * Created by zoonman on 1/31/17.
 */
const chalk = require('chalk');

module.exports = () => {
  console.log('Error!!!', arguments);
  /*console.trace(
      chalk.red.bold('Stack trace:'),
      arguments[0]);
  console.dir(arguments, {colors: true});*/
};
