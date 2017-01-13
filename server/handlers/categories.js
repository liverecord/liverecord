/**
 * Created by zoonman on 11/19/16.
 */
const Category = require('../schema').Category;

module.exports = function(socket) {
    socket.on('categories', function (question, fn) {
        Category.find({}).sort({order: 1}).select('name slug description').lean().exec(function(err, data) {
            fn(data);
        });
    });


};

