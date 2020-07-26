/**
 * Created by zoonman on 12/10/16.
 */
const xtend = require('xtend');

const async = require('async');
const models = require('../schema');
const Topic = models.Topic;
const CommentStruct = require('./envelope').comment;
const TypingStruct = require('./envelope').typing;
const TopicListStruct = require('./envelope').topicList;
const purify = require('./purify');
const mailer = require('./mailer');
const errorHandler = require('./errors');
const push = require('./push');
const getUrls = require('./geturls');
const Metaphor = require('metaphor');

function addAttachments(comment, callback) {
  let urls = getUrls(comment.body);
  console.log('urls', urls);
  const engine = new Metaphor.Engine();

  var retrievals = {};
  urls.forEach(function(url) {
    retrievals[url] = function(retrievalDone) {


      engine.describe(url, function(oinfo) {
        console.log('Metaphor', oinfo);
        retrievalDone(null, oinfo);

      });
    };
  });
  if (urls.length > 0) {
    async.parallel(retrievals, callback);
  } else {
    callback(null, {});
  }
}

function updateHandler(err, data) {
  if (err) {
    return errorHandler(err);
  }
}

function updateTopicAndFanOut(socket, foundTopic, savedComment) {
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
        _id: foundTopic._id
      },
      {
        $set: {
          updated: savedComment.created
        }
      }
  ).exec(updateHandler);

}

function broadcastToDiscussionParticipants(io, socket, foundTopic, webTopic) {
  //
  models
      .TopicFanOut
      .find({
        topic: foundTopic._id,
        user: {$ne: socket.webUser._id}
      })
      .populate({
        path: 'user',
        match: { online: true },
        select: '_id'
      })
      .lean()
      .then(function(users) {
        if (users) {
          users.map(function(curEl) {
            if (curEl.updates === 0) {
              curEl.updates = 1;
            }
            webTopic.updates = curEl.updates;
            //console.log(chalk.cyan(JSON.stringify(curEl)));
            if (curEl.user) {
              // broadcast event for everyone online
              io
                  .to('user:' + curEl.user._id)
                  .emit(
                      'topics',
                      TopicListStruct([webTopic])
                  );
            }
          });
        }
      })
      .catch(errorHandler);
}

function sendEmailNotifications(socket, savedComment, foundTopic, commentUrl) {
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

              let html = '' + purify(
                  savedComment.body,
                  true
              );

              html = html
                  .substr(0, 255)
                  .trim() + '...';
              html = '<p><b>' + socket.webUser.name +
                  '</b>:</p>' +
                  '<div style="white-space: pre-wrap;">' +
                  html +
                  '</div>' +
                  '<hr>' +
                  '<a href="' +
                  commentUrl +
                  '">Открыть тему</a>';

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
                          //console.log('emaill', user.email)
                          mailer({
                                to: user.email,
                                subject: foundTopic.title,
                                html: html
                              }
                          );
                        });
                      },
                      errorHandler
                  );
            }
          }
      );

}

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
          comment.body = purify(comment.body, false, true);
        }
        catch (e) {
          comment.body = purify(comment.body, true);
        }

        if (comment.body.length > 0) {

          addAttachments(comment, function(err, embeddingResults) {

            console.log('err embeddingResults', err);
            console.log('embeddingResults', embeddingResults);

            comment.attachments = [];
            /*
  */
            if (embeddingResults) {

              for (let link in embeddingResults) {
                if (embeddingResults.hasOwnProperty(link) &&
                    embeddingResults[link]) {
                  //
                  let info = embeddingResults[link];
                  let thumbnailUrl = '';
                  let html = '';
                  let description = '';
                  let title = 'View';
                  if (info.image && info.image.url) {
                    thumbnailUrl = info.image.url;
                  }
                  if (info.embed && info.embed.html) {
                    html = info.embed.html;
                  }
                  if (!thumbnailUrl && info.embed && info.embed.type &&  info.embed.type === 'photo') {
                    thumbnailUrl = info.embed.url;
                  }
                  if (!thumbnailUrl && info.icon && info.icon.any) {
                    thumbnailUrl = info.icon.any;
                  }
                  if (info.site_name) {
                    title = info.site_name;
                  }
                  if (info.title) {
                    title = info.title;
                  }
                  if (info.description) {
                    description = info.description;
                  }
                  var attachment = {
                    type: info.type + '',
                    title: title,
                    link: link,
                    description: description,
                    thumbnailUrl: thumbnailUrl,
                    html: html
                  };
                  comment.attachments.push(attachment);
                }
              }
            }


            console.log('comment', comment);


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
                      comment.user = socket.webUser;

                  console.log('ready comment', comment);


                  var newComment = new models.Comment(comment);
                  console.log('ready newComment', newComment);
                      //newComment.user = socket.webUser._id;

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

                            var simpleTopic = foundTopic.toObject();
                            simpleTopic.updated = savedComment.created;
                            simpleTopic.updates = +(simpleTopic.user._id != savedComment.user._id);
                            io.emit(
                                channel,
                                TopicListStruct([simpleTopic])
                            );

                            io.emit(
                                'topic:' + foundTopic.slug,
                                detailedComment
                            );
                            var commentUrl =
                                process.env.SERVER_PROTOCOL +
                                '://' +
                                process.env.SERVER_NAME +
                                '/' + foundTopic.category.slug +
                                '/' +
                                foundTopic.slug +
                                '#comment_' + savedComment._id;


                            sendEmailNotifications(
                                socket,
                                savedComment,
                                foundTopic,
                                commentUrl
                            );
                            updateTopicAndFanOut(
                                socket,
                                foundTopic,
                                savedComment
                            );
                            broadcastToDiscussionParticipants(
                                io,
                                socket,
                                foundTopic,
                                simpleTopic
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
                            push.notifyUsers(
                                webpush, foundTopic, socket, pushPayload
                            );
                            antiSpam.processComment(savedComment);

                          })
                          .catch(errorHandler);
                })
                .catch(errorHandler);
          });
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
    // {path: 'user', select: 'name picture slug rank'}
        models.Comment
            .findOne({_id: voteData.comment._id})
           // .select('topic rating solution')
            .populate({
              path: 'topic', select: 'user slug category',
            })
            .then(function(foundComment) {
                  'use strict';
                  var rating = 0, solution = foundComment.get('solution');
                  console.log('solution', solution, foundComment)
                  switch (voteData.action) {
                    case 'up':
                      rating = 1;
                      break;
                    case 'down':
                      rating = -1;
                      break;
                    case 'solution':
                      console.log('socket.webUser', socket.webUser);
                      // only topic owner can change correct answer
                      if (foundComment.topic.user.toString() === socket.webUser._id.toString()) {
                        foundComment.solution = ! solution;
                        foundComment.save();

                        const channel = 'topic:' +
                            foundComment.topic.slug;
                        const detailedComment = CommentStruct(
                            foundComment.toObject()
                        );
                        io.emit(channel, detailedComment);
                      }
                      return;
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
