/**
 * Created by zoonman on 1/31/17.
 */

module.exports = function errorHandler() {
  console.trace(arguments[0]);
  console.dir(arguments, {colors: true});
};
