/**
 * Created by zoonman on 12/12/16.
 */
const fs = require('fs');
const models = require('../schema');
const lrEnvelopes = require('./envelope');
const purify = require('./purify');

const TopicListStruct = lrEnvelopes.topicList;
const TopicStruct = lrEnvelopes.topic;
const CommentListStruct = lrEnvelopes.commentList;

const TOPICS_PER_PAGE = 50;

function topics(socket, handleError) {

  var d = new Date(); // Today!
  d.setMonth(d.getMonth() - 1);

  socket.on('subscribe', function(subscription) {

        if (subscription.type) {

          var getTopics = function(conditions, slug, patches) {
            var options = {}, sortOptions = {};
            if (subscription.term) {
              conditions['$text'] = { $search: subscription.term };
              options = { score: { $meta: 'textScore' } };
              sortOptions = {score : { $meta : 'textScore' }, updated: -1};
            } else {
              sortOptions = {updated: -1};
            }

            models.Topic.find(conditions, options)
                .sort(sortOptions)
                .limit(TOPICS_PER_PAGE)
                .select('title slug category created updated')
                .populate('category')
                .lean()
                .exec(function(err, topics) {
                      if (err) {
                        handleError(err);
                      } else {
                        if (topics) {
                          if (patches) {

                            for (var i = 0, l = topics.length; i < l; i++) {
                              patches.forEach(function(patch) {
                                console.log('topics[i]._id', topics[i]._id, patch._id);
                                if (topics[i]._id.toString() === patch._id.toString()) {

                                  console.log('match')
                                  topics[i]['updates'] = patch.updates;

                                }
                              });
                            }
                            console.log(topics)
                          }
                          socket.emit(
                              'topics:' + slug,
                              TopicListStruct(topics)
                          );
                        }
                      }
                    }
                );
          };

          var getCategoryTopics = function(slug) {
            models.Category.findOne({slug: slug})
                .then(function(foundCategory) {
                  conditions = {
                    category: foundCategory._id,
                    updated: {$gte: d},
                    spam: false
                  };

                  getTopics(conditions, foundCategory.slug);
                });
          };

          switch (subscription.type) {
            case 'category':
              if (subscription.slug) {
                getCategoryTopics(subscription.slug);
              }
              break;
            case 'section':
              var conditions = {};
              if (subscription.section) {
                switch (subscription.section) {
                  case 'recentlyViewed':
                    break;
                  case 'participated':
                    models.TopicFanOut.aggregate(
                        {$match: {user: socket.webUser._id, updates: {$gt: 0}}},
                        {$sort: {updates: -1, updated: -1}},
                        {
                          $group: {
                            _id: '$topic',
                            updates: {$first: '$updates'},
                            updated: {$first: '$updated'}
                          }
                        },
                        {$limit: TOPICS_PER_PAGE},
                        function(err, patch) {
                          if (err) {
                            return handleError(err);
                          }
                          console.log(patch); // [ { maxBalance: 98000 } ]
                          conditions = {
                            '_id': {
                              '$in': patch.map(function(el) {
                                return el._id;
                              })
                            }

                          };
                          getTopics(conditions, 'participated', patch);
                        }
                    );
                    break;
                  case 'newTopics':
                    getCategoryTopics(subscription.slug);
                    break;
                  case 'bookmarks':
                    models.Bookmark
                        .find({user: socket.webUser._id}, {topic: 1})
                        .sort({created: -1})
                        .limit(TOPICS_PER_PAGE)
                        .lean()
                        .then(function(bookmarks) {
                              console.log(bookmarks); // [ { maxBalance: 98000
                                                      // } ]
                              conditions = {
                                '_id': {
                                  '$in': bookmarks.map(function(el) {
                                        return el.topic;
                                      }
                                  )
                                }
                              };
                              getTopics(conditions, 'bookmarks');
                            }
                        );
                    break;
                }
              }

              break;
            case 'topic':
              if (subscription.slug) {
                models.Topic.findOne({slug: subscription.slug, spam: false})
                    .then(function(foundTopic) {
                      //console.info('foundTopic', foundTopic);
                      socket.join(
                          'topic:' + foundTopic.slug,
                          function() {
                            //console.info('joined', foundTopic.slug);
                            // we can load it in parallel
                            models.Topic.populate(foundTopic, [
                                  {path: 'category'},
                                  {path: 'user',
                                    select: 'name picture slug online'}
                                ]
                            ).then(
                                function(populatedTopic) {
                                    var clonedTopic = JSON.parse(JSON.stringify(
                                        populatedTopic
                                        )
                                    );
                                    models
                                        .Bookmark
                                        .findOne({topic: clonedTopic._id})
                                        .then(function(bookmark) {
                                            if (bookmark) {
                                              clonedTopic.bookmark = bookmark;
                                            } else {
                                              clonedTopic.bookmark = false;
                                            }
                                            socket.emit(
                                                'topic:' + foundTopic.slug,
                                                TopicStruct(clonedTopic)
                                            );
                                            }
                                        )
                                        .catch(function(reason) {
                                                clonedTopic.bookmark = false;
                                                socket.emit(
                                                    'topic:' + foundTopic.slug,
                                                    TopicStruct(clonedTopic)
                                                );
                                                handleError(reason);
                                            }
                                        );

                                }, handleError
                            );
                            //
                            models
                                .Comment
                                .find({
                                      topic: foundTopic._id,
                                      spam: false
                                })
                                .sort({created: -1})
                                .limit(500)
                                .populate([
                                      {
                                        path: 'user',
                                        select: 'name picture slug online'
                                      }
                                    ]
                                )
                                .lean()
                                .exec(function(err, data) {
                                      if (err) {
                                        handleError(err);
                                      } else {
                                        if (data) {
                                          socket.emit(
                                              'topic:' + foundTopic.slug,
                                              CommentListStruct(data)
                                          );
                                        }
                                      }
                                });

                      }
                      );
                      if (socket.webUser) {
                        models.TopicFanOut.update({
                              topic: foundTopic._id,
                              user: socket.webUser._id
                            },
                            {$set: {updates: 0}},
                            {upsert: true}
                        );
                      }

                    }
                    )
                    .catch(handleError);
              }

              break;
          }
        }
      }
  );

  models.Topic.find({updated: {$gte: d}, spam: false})
      .sort({updated: -1})
      .limit(TOPICS_PER_PAGE)
      .select('title slug category created updated')
      .populate('category')
      .lean()
      .exec(function(err, data) {
            if (err) {
              handleError(err);
            } else {
              if (data) {
                socket.emit('topics:', TopicListStruct(data));
              }
            }
          }
      );
}

function expressRouter(req, res, next) {
  'use strict';

  var errorHandler = function(err) {
    res.writeHead(502, {
          'Content-Type': 'text/javascript'
        }
    );
    res.write('{"success":"false","info": ' + JSON.stringify(err) + '}');
    res.end();
  };

  if (req.params.hasOwnProperty('category') &&
      req.params.hasOwnProperty('topic')) {

    if ('users' === req.params.category) {
      fs.readFile(__dirname + '/../public/index.html',
          'utf8',
          function(err, indexData) {
            if (err) {
                return errorHandler(err);
            }
            indexData = indexData.replace('<title></title>',
                '<title>LinuxQuestions - живой форум про Линукс и свободные программы</title>'
            );
            res.writeHead(200, {
                  "Content-Type": "text/html;encoding: utf-8"
                }
            );
            res.write(indexData);
            res.end();

          }
      );
    } else {

      models.Topic.findOne({slug: req.params.topic, spam: false})
          .then(function(foundTopic) {
                models.Topic.populate(foundTopic, [
                      {path: 'category'},
                      {path: 'user', select: 'name picture slug'}
                    ]
                ).then(function(populatedTopic) {
                      fs.readFile(__dirname + '/../public/index.html',
                          'utf8',
                          function(err, indexData) {
                              if (err) {
                                  return errorHandler(err);
                              }
                            if (populatedTopic) {
                              fs.readFile(__dirname + '/../public/dist/t/topic.tpl',
                                  'utf8',
                                  function(err, topicData) {
                                      if (err) {
                                          return errorHandler(err);
                                      }
                                    indexData = indexData.replace('<title></title>',
                                        '<title>' + populatedTopic.title.substr(0, 80)
                                            .replace(/\n/g, ' ') + '</title>'
                                    );
                                    var body = purify(populatedTopic.body, true);
                                    indexData = indexData.replace(
                                        '<meta name="description" content="">',
                                        '<meta name="description" content="' + body.substr(
                                            0,
                                            250
                                        ).replace(/\n/g, ' ') + '">'
                                    );
                                    topicData = topicData.replace('{{topic.title}}',
                                        populatedTopic.title
                                    );
                                    topicData = topicData.replace(
                                        /\{\{topic\.user\.slug}}/g,
                                        populatedTopic.user.slug
                                    );
                                    topicData = topicData.replace(
                                        '{{topic.user.picture}}',
                                        populatedTopic.user.picture
                                    );
                                    topicData = topicData.replace('{{topic.user.name}}',
                                        populatedTopic.user.name
                                    );
                                    topicData = topicData.replace(
                                        '{{topic.created | date:\'short\'}}',
                                        populatedTopic.created.toDateString()
                                    );
                                    topicData = topicData.replace(
                                        '<div class="topic-body" ng-bind-html="topic.body">',
                                        '<div class="topic-body" ng-bind-html="topic.body">' + populatedTopic.body
                                    );
                                    indexData = indexData.replace(
                                        '<div class="view-panel flex-row" ng-view="">',
                                        '<div class="view-panel flex-row" ng-view="">' + topicData
                                    );
                                    if (populatedTopic.tags) {
                                      indexData = indexData.replace(
                                          '<meta name="keywords" content="">',
                                          '<meta name="keywords" content="' + populatedTopic.tags + '">'
                                      );
                                    }
                                    res.writeHead(200, {
                                          "Content-Type": "text/html;encoding: utf-8"
                                        }
                                    );
                                    res.write(indexData);
                                    res.end();
                                  }
                              );
                            } else {
                              res.writeHead(404, {
                                    "Content-Type": "text/html;encoding: utf-8"
                                  }
                              );
                              res.write(indexData);
                              res.end();
                            }
                          }
                      );

                    }, errorHandler
                ).catch(errorHandler);
              }
          )
          .catch(errorHandler);
    }
  }

}

module.exports.socketHandler = topics;
module.exports.expressRouter = expressRouter;
