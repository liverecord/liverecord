var mongoose = require('mongoose');
var death = require('death');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(process.env.npm_package_config_webserver_port);

app.get('/', function (req, res) {
    console.log(__dirname);
    res.sendFile(__dirname + '/public/index.html');
});
app.get('/dist/j/main.1.js', function (req, res) {
    console.log(__dirname);
    res.sendFile(__dirname + '/public/dist/j/main.1.js');
});

mongoose.Promise = global.Promise;

mongoose.connect(process.env.npm_package_config_mongodb_uri);

var mongooseConnection = mongoose.connection;
mongooseConnection.on('error', console.error.bind(console, 'connection error:'));
mongooseConnection.once('open', function() {
    // we're connected!
    var models = require('./schema');

    io.on('connection', function (socket) {
        socket.emit('news', { hello: 'world' });
        socket.on('my other event', function (data) {
            console.log(data);
        });


        setInterval(function() {
            if (socket)
            socket.emit('thread', {
                id: new Date(),
                title: 'world',
                body: (new Date()).toISOString()
            });
        }, 500);

    });

    app.get('/api/categories', function (req, res) {
        models.Category.find({}).select('name slug').exec(function(err, data) {
           res.json(data);
           // socket.emit('news', { hello: 'lol' });
        });

    });


        /*

        var cat1 = new models.Category({
            name: 'Начинающим'
        });

        cat1.save(function (err, fluffy) {
            if (err) return console.error(err);
        });


        var u1 = new models.User({
            name: 'Русское имя',
            email: 'b122@g.com'
        });

        u1.save(function (err, fluffy) {
            if (err) return console.error(err);
        });


        var p1 = new models.Post({
            title: 'cool',
            body: 'ddd'
        });
        p1.user = u1;
        p1.save(function (err, fluffy) {
            if (err) return console.error(err);
        });*/


});

// cleanup resources correctly
death(function(signal, err) {
    if (mongooseConnection) {
        mongooseConnection.close();
    }
    if (server) {
        server.close();
    }
    if (io) {
        io.close();
    }

    console.log(signal);
    console.log(err);

    return 0;
});
