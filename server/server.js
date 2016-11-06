var mongoose = require('mongoose');
var death = require('death');
mongoose.Promise = global.Promise;

mongoose.connect(process.env.npm_package_config_mongodb_uri);

var mongooseConnection = mongoose.connection;
mongooseConnection.on('error', console.error.bind(console, 'connection error:'));
mongooseConnection.once('open', function() {
    // we're connected!
    var models = require('./schema');

    var cat1 = new models.Category({
        name: 'a',
        slug: 'b'
    });

    cat1.save(function (err, fluffy) {
        if (err) return console.error(err);
    });


/*
    var u1 = new models.User({
        name: 'Русское имя',
        email: 'b1@g.com'
    });

    u1.save(function (err, fluffy) {
        if (err) return console.error(err);
    });*/

});

// cleanup resources correctly
death(function(signal, err) {
    if (mongooseConnection) {
        mongooseConnection.close();
    }
});
