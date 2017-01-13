/**
 * Created by zoonman on 12/10/16.
 */
const models = require('../schema');
const Topic = models.Topic;
const xtend = require('xtend');
const CommentStruct = require('./envelope').comment;
const TypingStruct = require('./envelope').typing;
const TopicListStruct = require('./envelope').topicList;
const purify = require('./purify');
const mailer = require('./mailer');

function comments(socket, io, antiSpam, handleError) {


    socket.on('comment', function(comment, fn) {

        comment = xtend({
            'body': '',
            'topic': {_id: ''}
        }, comment);

        try {
            comment.body = purify(comment.body);
        } catch (e) {
            comment.body = purify(comment.body, true);
        }


        if (comment.body.length > 0) {

            Topic.findOne({_id: comment.topic._id}).then(function(foundTopic) {

                var newComment = new models.Comment(comment);

                newComment.user = socket.webUser;

                newComment.save(function (err, savedComment) {
                    if (err) {
                        fn(err);
                        return handleError(err);
                    } else {
                        fn(CommentStruct(savedComment));

                        const details = [
                            {path: 'category', options: {lean: true}}
                        ];

                        models.Topic.populate(foundTopic, details, function(err, detailedTopic) {
                            if (err) {
                                handleError(err);
                            } else {
                                var channel = 'topics:' + detailedTopic.category.slug;
                                //setTimeout(function() {

                                var pComment = JSON.parse(JSON.stringify(savedComment));
                                pComment['user'] = socket.webUser;

                                console.log(' socket.webUser', socket.webUser);
                                console.log('pComment', pComment);

                                const detailedComment = CommentStruct(pComment);
                                io.emit(channel, detailedComment);



                                var foundTopic2 = JSON.parse(JSON.stringify(detailedTopic));
                                foundTopic2.updated = savedComment.created;
                                foundTopic2.updates = +(foundTopic2.user._id != savedComment.user._id);
                                io.emit(channel, TopicListStruct([foundTopic2]));


                                io.emit('topic:' + detailedTopic.slug, detailedComment);
                                //}, 100);

                                models.Comment.distinct('user', {topic: savedComment.topic}, function(err, userList) {
                                    if (err) return handleError(err);

                                    if (userList) {
                                        userList.push(detailedTopic.user);
                                        //console.log('userList', userList);

                                        models.User.find({_id: {$in: userList}, online: false, 'settings.notifications.email': true}).lean().then(function(users) {
                                            console.log('userList', users);
                                            //
                                            users.forEach(function(user) {
                                                console.log('emaill', user.email)
                                                mailer({
                                                    to: user.email,
                                                    subject: 'Комментарий к теме ' + detailedTopic.title,
                                                    html: '<div style="white-space: pre-wrap;">' + savedComment.body + '</div>' +
                                                    '<hr>' +
                                                    '<a href="' +
                                                    'http://'+ process.env.npm_package_config_server_name +
                                                    '/' + detailedTopic.category.slug +
                                                    '/' +
                                                    '' + detailedTopic.slug +
                                                    '">Открыть тему</a>'
                                                });
                                            });
                                        }, handleError);
                                    }
                                });

                            }
                        });

                        models.TopicFanOut.update(
                            {
                                topic: foundTopic._id,
                                user: socket.webUser._id
                            },
                            {
                                $set: {
                                    updates: 0,
                                    updated: savedComment.created
                                }
                            },
                            {upsert: true}
                        ).exec();
                        models.TopicFanOut.update(
                            {
                                topic: foundTopic._id,
                                user: {$ne: socket.webUser._id}
                            },
                            {
                                $inc: {
                                    updates: 1
                                },
                                $set: {
                                    updated: savedComment.created
                                }
                            }
                        ).exec();

                        models.Topic.update(
                            {
                                topic: foundTopic._id
                            },
                            {
                                $set: {
                                    updated: savedComment.created
                                }
                            }
                        ).exec();

                        antiSpam.processComment(savedComment);


                    }
                });

            });


        } else {
            fn({error: 'too_short'});
        }


    });

    socket.on('typing', function(typing) {
        typing = xtend({
            'slug': '_'
        }, typing);
        io.volatile.emit('topic:' + typing.slug, TypingStruct(socket.webUser));
    });


}

module.exports = comments;
