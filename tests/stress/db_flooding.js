/**
 * Created by zoonman on 1/10/17.
 */
const mongoose = require('mongoose');
const death = require('death');
const gravatar = require('gravatar');

const words = 'Поддерживается голосовая и видео-связь, обмен сообщениями, создание конференций, обмен и совместный доступ к файлам, переадресация и удержание вызовов, запись звонков, различные кодеки (G711u, G711a, GSM, Speex, Opus, G.722), история вызовов с поиском, автоматический контроль громкости, шифрование видео, голоса и сообщений, интеграция с адресными книгами GNOME и KDE. Бинарные сборки подготовлены для GNU/Linux (Debian, Ubuntu, Fedora), Windows, macOS и Android, к которым скоро добавятся сборки для iOS и UWP (Universal Windows Platform)'.split(' ');

const maxUsers = 50;
const maxTopics = 10;
const maxComments = 1500;

// fixes bugs with promises in mongoose
mongoose.Promise = global.Promise;
mongoose.connect(process.env.npm_package_config_mongodb_uri);

var mongooseConnection = mongoose.connection;
mongooseConnection.on('error', console.error.bind(console, 'connection error:'));
mongooseConnection.once('open', function() {
    // we're connected!
    var models = require('../../server/schema');

    var u = [], ts = Date.now();


    for (var i = 0; i < maxUsers; i++) {
        var newEmail = 'stess_test' + ts + '-' + i + '@zoonman.com';
        u[i] = new models.User({

            name: getRandomWords(getRandomInt(2, 5)) + ' ' + ts + ' ' + i,
            picture : gravatar.url(newEmail, {s: '100', r: 'g', d: 'retro'}, true),
            email: newEmail});
        u[i].save();
        console.log('Creating user ',  u[i].name)
    }

    models.Category.find({}).sort({order: 1}).select('name slug').lean().exec(function(err, data) {




        var t = 0, c = 0,cMaxComments = 10,

            createNewComment = function(tpc) {
                c++;
                if (c > cMaxComments) return;
                try {
                    var tc = new models.Comment({
                        topic: tpc,
                        body: getRandomWords(getRandomInt(1, 50)),
                        user: u[getRandomInt(0, maxUsers)]
                    });
                    tc.save(function(err, coolComm) {
                        if (err) return console.log(err);
                        //console.log(coolComm);
                        createNewComment(tpc);
                    });
                } catch (e) {
                    //                    console.log(e);
                }
            },

            createNewTopic = function(cl) {
                if (t % 100 == 0) {
                    console.log('Creating topic ',  t, ' of ', maxTopics);
                }
                t++;
                if (t > maxTopics) return;
                try {
                    var top = new models.Topic({
                        category: data[getRandomInt(0, 4)],
                        title: getRandomWords(getRandomInt(1, 10)),
                        body: getRandomWords(getRandomInt(10, 100)),
                        user: u[getRandomInt(0, maxUsers)]
                    });
                    top.save(function(err, newTopic) {
                        c = 0;
                        //console.log(err);
                        cMaxComments = getRandomInt(100,maxComments);
                        if (!err) createNewComment(newTopic);

                        //createNewTopic();

                    });
                } catch (e) {
                    //console.log(e);
                    // createNewTopic();
                }
            };

        createNewTopic();
    });





});


// cleanup resources correctly
death(function(signal, err) {
    if (mongooseConnection) {
        mongooseConnection.close();
    }
    if (err) {
        console.log(err);
    }
    process.exit();
    return 0;
});

function getRandomWord() {
    return words[getRandomInt(0, words.length-1)];
}

function getRandomWords(number) {
    var w = '';
    for (var i = 0; i < number; i++) {
        w = w + ' ' + getRandomWord();
    }
    return w;
}


function getRandomText(l) {
   var t = '';
    for (var i= 0;i < l; i++)
        t += words.slice(
            getRandomInt(0, words.length / 4),
            getRandomInt(words.length / 4, words.length )
        ).join(' ');
    return t;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
