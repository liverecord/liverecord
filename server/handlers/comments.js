/**
 * Created by zoonman on 12/10/16.
 */
const xtend = require('xtend');
const jp = require('jsonpath');
const models = require('../schema');
const Topic = models.Topic;
const CommentStruct = require('./envelope').comment;
const TypingStruct = require('./envelope').typing;
const TopicListStruct = require('./envelope').topicList;
const purify = require('./purify');
const mailer = require('./mailer');
const errorHandler = require('./errors');
const pushFailureCodes = [401];

function comments(socket, io, antiSpam, webpush) {

  socket.on('comment', function(comment, fn) {

        comment = xtend(
            {
              'body': '',
              'topic': {_id: ''}
            },
            comment
        );

        try {
          comment.body = purify(comment.body);
        }
        catch (e) {
          comment.body = purify(comment.body, true);
        }

        if (comment.body.length > 0) {

          Topic
              .findOne({_id: comment.topic._id})
              .populate([
                    {path: 'category', options: {lean: true}}
                  ]
              )
              .then(function(foundTopic) {

                    console.log('foundTopic::', foundTopic)

                    comment.classification = antiSpam.getClassifications(
                        comment.body
                    );

                    comment.spam = false;

                    var newComment = new models.Comment(comment);

                    newComment.user = socket.webUser;

                    newComment
                        .save()
                        .then(function(savedComment) {

                          fn(CommentStruct(savedComment));

                          var channel = 'topics:' +
                              foundTopic.category.slug;

                          var pComment = savedComment.toObject();
                          pComment['user'] = socket.webUser;

                          console.log(' socket.webUser', socket.webUser);
                          console.log('pComment', savedComment.toObject());

                          const detailedComment = CommentStruct(pComment);
                          io.emit(channel, detailedComment);

                          var foundTopic2 = foundTopic.toObject();
                          foundTopic2.updated = savedComment.created;
                          foundTopic2.updates = +(foundTopic2.user._id != savedComment.user._id);
                          io.emit(
                              channel,
                              TopicListStruct([foundTopic2])
                          );

                          io.emit(
                              'topic:' + foundTopic.slug,
                              detailedComment
                          );
                          var commentUrl = 'http://' +
                              process.env.npm_package_config_server_name +
                              '/' + foundTopic.category.slug +
                              '/' +
                              foundTopic.slug +
                              '#comment_' + savedComment._id;
                          models
                              .Comment
                              .distinct('user',
                              {topic: savedComment.topic},
                              function(err, userList) {
                                if (err) {
                                  return errorHandler(err);
                                }

                                if (userList) {
                                  userList.push(foundTopic.user);
                                  //console.log('userList', userList);

                                  models
                                      .User
                                      .find({
                                            _id: {$in: userList},
                                            online: false,
                                            deleted: false,
                                            'settings.notifications.email': true
                                          }
                                      )
                                      .lean()
                                      .then(function(users) {
                                        console.log('userList', users);
                                        //
                                        users.forEach(function(user) {
                                          console.log('emaill', user.email)
                                          mailer({
                                                to: user.email,
                                                subject: 'Комментарий к теме ' + foundTopic.title,
                                                html: '<div style="white-space: pre-wrap;">' + savedComment.body + '</div>' +
                                                '<hr>' +
                                                '<a href="' +
                                                commentUrl +

                                                '">Открыть тему</a>'
                                              }
                                          );
                                        });
                                      },
                                      errorHandler
                                      );
                                }
                              }
                          );
                          const pushPayload = JSON.stringify({
                                action: 'subscribe',
                                title: socket.webUser.name +
                                ' комментирует ' + foundTopic.title,
                                id: savedComment._id,
                                link: commentUrl,
                                image: socket.webUser.picture,
                                body: purify(comment.body, true)
                              }
                          );
                          models
                              .TopicFanOut
                              .find({
                                    topic: foundTopic._id,
                                    user: {$ne: socket.webUser._id}
                                  }
                              )
                              .lean()
                              .populate({
                                    path: 'user',
                                    select: 'name settings devices'
                                  }
                              )
                              .then(function(topicFans) {
                                topicFans.forEach(function(fan) {
                                  console.log('fan', fan);

                                  if (fan.user.devices) {
                                    fan.user
                                        .devices
                                        .forEach(function(device) {
                                          console.log('device', device);
                                          if (device.pushEnabled) {
                                            webpush
                                                .sendNotification(
                                                    device.pushSubscription,
                                                    pushPayload
                                                )
                                                .then(function(result) {
                                                  console.log('Pushed', result);
                                                })
                                                .catch(function(reason) {
                                                  console.log('Push failed', fan.user._id, device._id, 'reason:', reason);
                                                  if (reason.statusCode &&
                                                      pushFailureCodes
                                                          .indexOf(
                                                              reason.statusCode
                                                          ) > -1) {
                                                    models
                                                        .User
                                                        .update(
                                                            {
                                                              _id: fan.user._id,
                                                            },
                                                            {
                                                              $pull: {
                                                                'devices': {
                                                                  _id:
                                                                  device._id
                                                                }
                                                              }
                                                            })
                                                        .then(function(r) {
                                                          console.log(r);
                                                        })
                                                        .catch(errorHandler);

                                                  }
                                                }
                                            );
                                          }
                                        });
                                  }
                                });
                              })
                              .catch(errorHandler);
                              //



                              function updateHandler(err, data) {
                                if (err) {
                                  return errorHandler(err);
                                }
                              }

                              models.TopicFanOut.update(
                                  {
                                    topic: foundTopic._id,
                                    user: socket.webUser._id
                                  },
                                  {
                                    $set: {
                                      updates: 0,
                                      updated: savedComment.created,
                                      commented: true
                                    }
                                  },
                                  {upsert: true}
                              ).exec(updateHandler);
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
                              ).exec(updateHandler);

                              models.Topic.update(
                                  {
                                    topic: foundTopic._id
                                  },
                                  {
                                    $set: {
                                      updated: savedComment.created
                                    }
                                  }
                              ).exec(updateHandler);

                              antiSpam.processComment(savedComment);

                        })
                        .catch(errorHandler);
              })
              .catch(errorHandler);;

        } else {
          fn({error: 'too_short'});
        }

      }
  );

  socket.on('typing', function(typing) {
        typing = xtend({
          'slug': '_'
        }, typing);
        socket
            .to('topic:' + typing.slug)
            .emit('topic:' + typing.slug, TypingStruct(socket.webUser));
      }
  );

  socket.on('vote', function(voteData) {

        models.Comment
            .findOne({_id: voteData.comment._id})
            .select('topic')
            .then(function(foundComment) {
                  'use strict';
                  var rating = 0;
                  switch (voteData.action) {
                    case 'up':
                      rating = 1;
                      break;
                    case 'down':
                      rating = -1;
                      break;
                  }
                  models
                      .CommentVote
                      .update({
                            comment: foundComment._id,
                            user: socket.webUser._id
                          }, {
                            $set: {
                              topic: foundComment.topic,
                              rating: rating
                            }
                          },
                          {upsert: true}
                      )
                      .then(function(updateResult) {
                            return models
                                .CommentVote
                                .aggregate([
                                      {$match: {comment: foundComment._id}},
                                      {
                                        $group: {
                                          _id: '$comment',
                                          commentRating: {$sum: '$rating'}
                                        }
                                      }
                                    ]
                                );
                          }
                      )
                      .then(function(aggregationResults) {
                            if (aggregationResults[0]) {
                              foundComment.rating =
                                  aggregationResults[0].commentRating;
                              foundComment.save();
                            }
                          }
                      )
                      .catch(errorHandler);
                }
            );
      }
  );

  socket.on('report', function(voteData) {
        models.Comment
            .findOne({_id: voteData.comment._id})
            .then(function(foundComment) {
                  'use strict';
                  mailer({
                        to: 'zoonman@gmail.com',
                        subject: '[LQ] ' + socket.webUser.name,
                        text: 'Turn html mode on!',
                        html: foundComment.body
                      }
                  );
                }
            );
      }
  );

  var markCommentAs = function(comment, label) {
    models.Comment.findOne({_id: comment}).then(function(comment) {
      if (comment) {
        var commentText = purify(comment.body, true);
        antiSpam.classifier.addDocument(commentText, label);
        antiSpam.classifier.retrain();
        comment.spam = (label === 'spam');
        comment.moderated = true;
        comment.save(function(err) {
              if (err) {
                console.log(err);
              }
            }
        );
      } else {
        //
      }
    });
    return true;
  };

  socket.on('moderate', function(data, socketCallback) {
        var r = {success: true};
        if (data.type) {
          switch (data.type) {
            case 'comment':
              if (socket.webUser &&
                  socket.webUser.roles &&
                  socket.webUser.roles.indexOf('moderator') > -1) {
                //
                if (data.action) {
                  switch (data.action) {
                    case 'spam':
                      r['success'] = markCommentAs(data.comment._id, data.action);
                      break;
                    case 'ok':
                      r['success'] = markCommentAs(data.comment._id, data.action);
                      break;
                    case 'delete':
                      break;
                  }
                }
              }
              break;
          }
        }
        socketCallback(r);
      }
  );
}

module.exports = comments;
