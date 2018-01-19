/**
 * Created by zoonman on 12/12/16.
 */
const fs = require('fs');
const async = require('async');
const xtend = require('xtend');
const models = require('../schema');
const lrEnvelopes = require('./envelope');
const staticHandlers = require('./static');

const TopicListStruct = lrEnvelopes.topicList;
const TopicStruct = lrEnvelopes.topic;
const CommentListStruct = lrEnvelopes.commentList;

const TOPICS_PER_PAGE = 50;
const SECTION_NEW_TOPICS = 'newTopics';
const SECTION_RECENTLY_VIEWED = 'recentlyViewed';
const SECTION_PARTICIPATED = 'participated';
const SECTION_BOOKMARKS = 'bookmarks';

function topics(socket, handleError) {

  var d = new Date(); // Today!
  d.setMonth(d.getMonth() - 3);

  socket.on('topics', function(requestData) {
    'use strict';
    //
    requestData = xtend({
      tab: SECTION_NEW_TOPICS,
      category: '',
      term: '',
      before: 0
    }, requestData);

    var getTopics = function(conditions, patches) {
      var options = {}, sortOptions = {};
      if (requestData.term) {
        conditions['$text'] = { $search: requestData.term };
        options = { score: { $meta: 'textScore' } };
        sortOptions = {score: { $meta: 'textScore' }, updated: -1};
      } else {
        sortOptions = {updated: -1};
      }
      if (socket.webUser) {
        //
        conditions['$or'] = [
          {private: false},
          {user: socket.webUser._id},
          {acl: socket.webUser._id}
        ];
      } else {
        conditions['private'] = false;
      }
      if (requestData.before > 0) {
        conditions.updated = {$lte: requestData.before};
      }
      console.log('conditions:', conditions);
      models.Topic.find(conditions, options)
          .sort(sortOptions)
          .limit(TOPICS_PER_PAGE)
          .select('title slug category created updated private')
          .populate('category')
          .lean()
          .exec(function(err, topics) {
                if (err) {
                  handleError(err);
                } else {
                  if (topics) {
                    //console.log('patches:', patches)
                    if (patches) {
                      for (var i = 0, l = topics.length; i < l; i++) {
                        patches.forEach(function(patch) {
                          //console.log('topics[i]._id',
                          // topics[i]._id, patch._id);
                          if (topics[i]._id.toString() ===
                              patch._id.toString()) {

                            //console.log('match');
                            topics[i]['updates'] = patch.updates;

                          }
                        });
                      }
                      //console.log(topics)
                    }
                    socket.emit(
                        'topics',
                        TopicListStruct(topics)
                    );
                  }
                }
              }
          );
    };

    var resolveCategory = function(callback) {
      models
          .Category
          .findOne({slug: requestData.category})
          .then(function(cat) {
            callback(null, cat);
            console.log('cat', cat)
          })
          .catch(callback);
    };

    var resolveSection = function(category, callback) {
      var conditions = {};
      if (category) {
        conditions.category = category._id;
      }
      switch (requestData.tab) {
        case SECTION_RECENTLY_VIEWED:
          if (!socket.webUser) {
            return;
          }
          models.TopicFanOut.aggregate(
              {$match: {user: socket.webUser._id}},
              {$sort: {updated: -1}},
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
                conditions['_id'] = {
                  '$in': patch.map(function(el) {
                    return el._id;
                  })
                };
                getTopics(conditions, patch);
              }
          );
          break;
        case SECTION_BOOKMARKS:
          if (!socket.webUser) {
            return;
          }
          models.Bookmark
              .find({user: socket.webUser._id}, {topic: 1})
              .sort({created: -1})
              .limit(TOPICS_PER_PAGE)
              .lean()
              .then(function(bookmarks) {
                    console.log(bookmarks); // [ { maxBalance: 98000
                                            // } ]
                    conditions['_id'] = {
                      '$in': bookmarks.map(function(el) {
                            return el.topic;
                          }
                      )
                    };
                    getTopics(conditions, []);
                  }
              );
          break;
        case SECTION_PARTICIPATED:
          if (!socket.webUser) {
            return;
          }
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
                conditions['_id'] = {
                  '$in': patch.map(function(el) {
                    return el._id;
                  })
                };
                getTopics(conditions, patch);
              }
          );
          break;
        default:
          getTopics(conditions, []);
      }
      callback(null);
    };

    async.waterfall([
      resolveCategory,
      resolveSection
    ], function (err, result) {
      // result now equals 'done'
    });


  });

  socket.on('subscribe', function(subscription) {

        if (subscription.type) {

          var getTopics = function(conditions, slug, patches) {
            var options = {}, sortOptions = {};
            if (subscription.term) {
              conditions['$text'] = { $search: subscription.term };
              options = { score: { $meta: 'textScore' } };
              sortOptions = {score: { $meta: 'textScore' }, updated: -1};
            } else {
              sortOptions = {updated: -1};
            }
            if (socket.webUser) {
              //
              conditions['$or'] = [
                {private: false},
                {user: socket.webUser._id},
                {acl: socket.webUser._id}
              ];
            } else {
              conditions['private'] = false;
            }
            console.log(conditions);
            models.Topic.find(conditions, options)
                .sort(sortOptions)
                .limit(TOPICS_PER_PAGE)
                .select('title slug category created updated private')
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
                  if (foundCategory) {
                    conditions = {
                      category: foundCategory._id,
                      updated: {$gte: d},
                      spam: false
                    };
                    getTopics(conditions, foundCategory.slug);

                  } else {
                    conditions = {
                      updated: {$gte: d},
                      spam: false
                    };
                    getTopics(conditions, '');

                  }

                }).catch(handleError);
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
                    models.TopicFanOut.aggregate(
                        {$match: {user: socket.webUser._id}},
                        {$sort: {updated: -1}},
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
                          getTopics(conditions, 'recentlyViewed', patch);
                        }
                    );
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

                var oneTopicConditions = {
                  slug: subscription.slug,
                  deleted: false,
                  spam: false
                };
                if (socket.webUser) {
                  //
                  oneTopicConditions['$or'] = [
                    {private: false},
                    {user: socket.webUser._id},
                    {acl: socket.webUser._id}
                  ];
                } else {
                  oneTopicConditions['private'] = false;
                }

                models.Topic.findOne(oneTopicConditions)
                    .then(function(foundTopic) {
                      if (!foundTopic) return;
                      socket.join(
                          'topic:' + foundTopic.slug,
                          function() {
                            async.parallel({
                              topicData: function(callback) {
                                models
                                    .Topic
                                    .populate(foundTopic, [
                                      {path: 'category'},
                                      {path: 'user',
                                        select: 'name picture slug online rank'},
                                      {path: 'acl',
                                        select: 'name picture slug online rank'}
                                    ]
                                ).then(function(resolve, reject) {
                                  callback(reject, resolve);
                                });
                              },
                              bookmarkData: function(callback) {
                                models
                                    .Bookmark
                                    .findOne({topic: foundTopic._id})
                                    .then(function(resolve, reject) {
                                      callback(reject, resolve);
                                    });
                              },
                              fanOutData: function(callback) {
                                models
                                    .TopicFanOut
                                    .findOne({topic: foundTopic._id})
                                    .then(function(resolve, reject) {
                                      callback(reject, resolve);
                                    });
                              }
                            }, function(err, results) {
                              console.log('err', err, 'r', results);
                              var clonedTopic = results.topicData.toObject();
                              clonedTopic.bookmark = results.bookmarkData || false;
                              clonedTopic.fanOut = results.fanOutData || false;
                              socket.emit(
                                  'topic:' + foundTopic.slug,
                                  TopicStruct(clonedTopic)
                              );
                            });
                            //
                            models.
                                Comment.
                                paginate({
                                  topic: foundTopic._id,
                                  deleted: false,
                                  $or: [
                                    {moderated: true, spam: false},
                                    {moderated: false}
                                  ]
                                },{
                                  sort: {created: -1},
                                  populate: [
                                    {
                                      path: 'user',
                                      select: 'name picture slug online rank'
                                    }
                                  ],
                                  lean: true,
                                  limit: 10,
                                  page: subscription.page || 1
                                },
                                function(err, data) {
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
                            if (socket.webUser) {
                              models.
                              TopicFanOut.
                              update({
                                topic: foundTopic._id,
                                user: socket.webUser._id
                              },
                              {
                                $set: {
                                  updates: 0,
                                  updated: Date.now(),
                                  viewed: Date.now()
                                }
                              },
                              {upsert: true}
                              ).exec(function(err, result) {
                                if (err) return handleError(err);
                              });
                            }
                      });
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



  models.Topic.find({
        updated: {$gte: d},
        spam: false,
        deleted: false,
        private: false
  })
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
      staticHandlers.expressRouter(req, res, next);
    } else {

      models
          .Topic
          .findOne({
            slug: req.params.topic,
            spam: false,
            deleted: false,
            private: false
          })
          .then(function(foundTopic) {
            models
                .Topic
                .populate(foundTopic, [
                  {path: 'category'},
                  {path: 'user', select: 'name picture slug rank'}
                ])
                .then(function(populatedTopic) {
                      var bodyModifier;
                      if (populatedTopic) {
                        // dirty business for SEO
                        bodyModifier = function(inputHtml) {
                          //
                          inputHtml = staticHandlers.modifyBody(
                              inputHtml,
                              {
                                title: populatedTopic.title.substr(0, 80)
                                    .replace(/\n/g, ' '),
                                description: populatedTopic.body.substr(
                                    0,
                                    250
                                ).replace(/\n/g, ' '),
                                keywords: [
                                  'Linux', 'СПО', 'форум',
                                  'чат', 'обсуждения', 'дискуссии'
                                ],
                                frontLiveRecordConfig:
                                    req.app.get('frontLiveRecordConfig')
                              });
                          var topicData = fs.readFileSync(
                              __dirname + '/../public/dist/t/topic.view.tpl',
                              'utf8'
                          );

                          /**
                           *
                           * @param {string} src
                           * @param {string} needle
                           * @param {string} substition
                           */
                          function tagReplace(src, needle, substition) {
                            function escapeRegExp(str) {
                              return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
                            }
                            let escr = escapeRegExp(needle);
                            console.log('escr:', escr);
                            let rg = new RegExp(escr, 'mig');

                            return src.replace(rg, needle + substition);
                          }
                          topicData = topicData.replace(
                              '{{topic.title}}',
                              populatedTopic.title
                          );
/*
                          topicData = topicData.replace(
                              /\{\{topic\.user\.slug}}/g,
                              populatedTopic.user.slug
                          );
                          topicData = topicData.replace(
                              '{{topic.user.picture}}',
                              populatedTopic.user.picture
                          );
                          *
                          topicData = topicData.replace(
                              'ng-bind="::topic.user.name">',
                              populatedTopic.user.name
                          );*/

                          topicData = tagReplace(topicData,
                              'ng-bind="::topic.user.slug">',
                              populatedTopic.user.slug
                          );

                          topicData = tagReplace(topicData,
                              'ng-bind="::topic.user.picture">',
                              populatedTopic.user.picture
                          );

                          topicData = tagReplace(topicData,
                              'ng-bind="::topic.user.name">',
                              populatedTopic.user.name
                          );

                          topicData = tagReplace(topicData,
                              'ng-bind="::topic.updated|date:\'short\'">',
                              populatedTopic.updated.toString()
                          );

                          topicData = tagReplace(topicData,
                              'ng-bind-html="topic.body">',
                              populatedTopic.body
                          );

                          topicData = tagReplace(topicData,
                              'ng-bind="topic.title">',
                              populatedTopic.title
                          );

                          topicData = tagReplace(topicData,
                              'ng-bind="::topic.created | date:\'short\'">',
                              populatedTopic.created.toDateString()
                          );

                          //

                          topicData = topicData.replace(
                              '{{topic.created | date:\'short\'}}',
                              populatedTopic.created.toDateString()
                          );
                          topicData = topicData.replace(
                              'ng-bind-html="topic.body">',
                              'ng-bind-html="topic.body">' + populatedTopic.body
                          );
                          inputHtml = inputHtml.replace(
                              'ng-view>',
                              'ng-view>' + topicData
                          );
                          return inputHtml;
                        };
                        staticHandlers.serveIndex(res, bodyModifier);
                      } else {
                        bodyModifier = function(inputHtml) {
                          //
                          return staticHandlers.modifyBody(
                              inputHtml,
                              {
                                title: 'Нет такой темы',
                                description: '',
                                keywords: [],
                                frontLiveRecordConfig:
                                    req.app.get('frontLiveRecordConfig')
                              });
                        };
                        staticHandlers.serveIndex(res, bodyModifier, 403);
                      }

                },
                errorHandler)
                .catch(errorHandler);
          })
          .catch(errorHandler);
    }
  }
}

module.exports.socketHandler = topics;
module.exports.expressRouter = expressRouter;
