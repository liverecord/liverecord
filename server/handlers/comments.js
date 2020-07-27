/**
 * Created by zoonman on 12/10/16.
 */
const xtend = require('xtend');

const { get: opGet } = require('object-path');
const {
  Comment,
  User,
  Topic,
  TopicFanOut
} = require('../schema');
const CommentStruct = require('./envelope').comment;
const TypingStruct = require('./envelope').typing;
const TopicListStruct = require('./envelope').topicList;
const purify = require('./purify');
const mailer = require('./mailer');
const errorHandler = require('./errors');
const push = require('./push');
const getUrls = require('./geturls');
const Metaphor = require('metaphor');

async function addAttachments(nc) {
  let urls = getUrls(nc.body);
  console.log('urls', urls);
  const engine = new Metaphor.Engine();
  const embeddingResults = await Promise.all(urls.map(async (url) => {
    return new Promise((res, rej) => {
      engine.describe(url, res);
    });
  }));
  console.log('embeddingResults', embeddingResults);
  nc.attachments = embeddingResults.map((info) => {
    let thumbnailUrl = opGet(info, 'image.url');
    if (!thumbnailUrl && opGet(info, 'embed.type', '') === 'photo') {
      thumbnailUrl = opGet(info, 'embed.url')
    }
    if (!thumbnailUrl) {
      thumbnailUrl = opGet(info, 'icon.any');
    }
    return {
      type: info.type,
      title: info.title || info.site_name || '-',
      link: info.url,
      description: opGet(info, 'description'),
      thumbnailUrl,
      html: opGet(info, 'embed.html', '')
    }
  });
  return nc;
}

function updateHandler(err, data) {
  if (err) {
    return errorHandler(err);
  }
}

function updateTopicAndFanOut(socket, foundTopic, savedComment) {
  TopicFanOut.update(
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
  TopicFanOut.update(
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

  Topic.update(
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
      TopicFanOut
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
      Comment
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


                  User
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

  socket.on('comment', async (comment, fn) => {

        const { body } = comment;
        const { topic } = comment;

        if (!body) {
          return;
        }
        if (!topic) {
          return;
        }

        const foundTopic = await Topic.findOne({_id: comment.topic._id}).populate([
              {path: 'category', options: {lean: true}}
            ]
        );

        if (!foundTopic) {
          return;
        }


        const nc = new Comment();
        nc.topic = foundTopic;

        try {
          nc.body = purify(body, false, true);
        }
        catch (e) {
          nc.body = purify(body, true);
        }

        if (nc.body) {
          nc.classification = antiSpam.getClassifications(
              comment.body
          );

          nc.spam = false;
          nc.user = socket.webUser;

          await addAttachments(nc);

          const savedComment = await nc.save();
          fn(CommentStruct(savedComment));

          const channel = 'topics:' + foundTopic.category.slug;

          const pComment = savedComment.toObject();
          pComment['user'] = socket.webUser;

          console.log('socket.webUser', socket.webUser);
          console.log('pComment', savedComment.toObject());

          const detailedComment = CommentStruct(pComment);
          io.emit(channel, detailedComment);

          const simpleTopic = foundTopic.toObject();
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
          const commentUrl =
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
        Comment
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
                                        CommentVote
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
                            return
                                CommentVote
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
        Comment
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
    Comment.findOne({_id: comment}).then(function(comment) {
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
