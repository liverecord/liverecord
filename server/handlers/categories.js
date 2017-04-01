/**
 * Created by zoonman on 11/19/16.
 */
const Category = require('../schema').Category;
const errorHandler = require('./errors');

module.exports = (socket) => {
  socket.on('categories', function(question, socketCallback) {
        Category.find({})
            .sort({order: 1})
            .select('name slug description')
            .lean()
            .then((data) => socketCallback(data))
            .catch(errorHandler);
      }
  );
};

