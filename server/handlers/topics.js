/**
 * Created by zoonman on 12/12/16.
 */
const models = require('../schema');
const lrEnvelopes = require('./envelope');

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
                models.Topic.find(conditions)
                    .sort({updated: -1})
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

                                    for(var i=0, l = topics.length; i < l; i++) {
                                        patches.forEach(function(patch) {
                                            console.log('topics[i]._id', topics[i]._id, patch._id);
                                            if (topics[i]._id.toString() == patch._id.toString()) {

                                                console.log('match')
                                                topics[i]['updates'] = patch.updates;

                                            }
                                        });
                                    }
                                    console.log(topics)
                                }
                                socket.emit('topics:' + slug, TopicListStruct(topics));
                            }
                        }
                    });
            };

            switch (subscription.type) {
                case 'category':
                    if (subscription.slug) {
                        models.Category.findOne({slug: subscription.slug}).then(function(foundCategory) {
                            conditions = {category: foundCategory._id, updated: { $gte: d }, spam: false };
                            getTopics(conditions, foundCategory.slug);
                        });
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
                                    {$match: { user: socket.webUser._id, updates: {$gt: 0} }},
                                    {$sort: { updates: -1, updated: -1}},
                                    {$group: { _id: '$topic', updates: {$first: '$updates'}, updated: {$first: '$updated'}}},
                                    {$limit: TOPICS_PER_PAGE},
                                    function (err, patch) {
                                        if (err) return handleError(err);
                                        console.log(patch); // [ { maxBalance: 98000 } ]
                                        conditions = {
                                            '_id': {
                                                '$in' : patch.map(function(el) {
                                                    return el._id;
                                                })
                                            }

                                        };

                                        getTopics(conditions, 'newbie', patch);
                                    }
                                );
                                break;
                            case 'newTopics':
                                break;
                            case 'bookmarks':
                                models.Bookmark
                                    .find({user: socket.webUser._id}, {topic: 1})
                                    .sort({created: -1})
                                    .limit(TOPICS_PER_PAGE)
                                    .lean()
                                    .then(function(bookmarks) {
                                        console.log(bookmarks); // [ { maxBalance: 98000 } ]
                                        conditions = {
                                            '_id': {
                                                '$in' : bookmarks.map(function(el) {
                                                    return el.topic;
                                                })
                                            }
                                        };
                                        getTopics(conditions, 'newbie');
                                    });
                                break;
                        }
                    }

                    break;
                case 'topic':
                    if (subscription.slug)
                    models.Topic.findOne({slug: subscription.slug, spam: false}).then(function(foundTopic) {
                        //console.info('foundTopic', foundTopic);
                        socket.join('topic:' + foundTopic.slug, function() {
                            //console.info('joined', foundTopic.slug);
                            // we can load it in parallel
                            models.Topic.populate(foundTopic, [
                                {path: 'category'},
                                {path: 'user', select: 'name picture slug'}
                            ]).then(function(populatedTopic) {
                                var clonedTopic = JSON.parse(JSON.stringify(populatedTopic));
                                models.Bookmark.findOne({topic: clonedTopic._id}).then(function(bookmark){
                                    if (bookmark) {
                                        clonedTopic.bookmark = bookmark;
                                    } else {
                                        clonedTopic.bookmark = false;
                                    }
                                    socket.emit('topic:' + foundTopic.slug, TopicStruct(clonedTopic));
                                }).catch(function(reason) {
                                    clonedTopic.bookmark = false;
                                    socket.emit('topic:' + foundTopic.slug, TopicStruct(clonedTopic));
                                    handleError(reason);
                                });
                                
                            }, handleError);
                            //
                            models.Comment.find({
                                topic: foundTopic._id,
                                spam: false
                                })
                                .sort({created: 1})
                                .populate([
                                    {path: 'user', select: 'name picture slug'}
                                ])
                                .lean()
                                .exec(function(err, data) {
                                    if (err) {
                                        handleError(err);
                                    } else {
                                        if (data) {
                                            socket.emit('topic:' + foundTopic.slug, CommentListStruct(data));
                                        }
                                    }
                                });

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

                    }).catch(handleError);

                    break;
            }
        }
    });

    models.Topic.find({updated: { $gte: d }, spam: false })
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
                    socket.emit('topics:' , TopicListStruct(data));
                }
            }
        });
}

module.exports = topics;
