/**
 * Created by zoonman on 11/19/16.
 */

const models = require('../schema');
const Topic = models.Topic;
const TopicStruct = require('./envelope').topic;
const xtend = require('xtend');
const purify = require('./purify');
const hljs = require('highlight.js');


function question(socket, io, errorHandler) {

    socket.on('ask', function (question, fn) {
        errorHandler('we got question!', question);


        question = xtend({
            'title': 'Без названия',
            'body': '',
            'category': {_id: ''}
        }, question);

        question.body = purify(question.body);
        question.title = purify(question.title, true);

        var newTopic = new Topic(question);

        errorHandler('decoded token: ', socket.decoded_token._id);

        newTopic.user = socket.webUser;

        errorHandler('new Topic: ', newTopic);

        newTopic.save(function (err, savedTopic) {
            if (err) {
                fn(err);
                return errorHandler(err);
            } else {
                fn(TopicStruct(savedTopic));

                const details = [
                    {path: 'category'}
                ];

                Topic.populate(savedTopic, details, function(err, detailedTopic) {
                    if (err) {
                        errorHandler(err);
                    } else {
                        var channel = 'topics:' + detailedTopic.category.slug;
                        setTimeout(function() {
                            io.emit(channel, TopicStruct(detailedTopic));
                        }, 100);
                    }
                });

                models.TopicFanOut.update(
                    {
                        topic: savedTopic._id,
                        user: socket.webUser._id
                    },
                    {
                        $set: {
                            updates: 0,
                            updated: Date.now()
                        }
                    },
                    {upsert: true}
                );
            }
        });
    });
}

module.exports = question;
