/**
 * Created by zoonman on 11/19/16.
 */

const models = require('../schema');
const Topic = models.Topic;
const lrEnvelopes = require('./envelope');
const TopicStruct = lrEnvelopes.topic;
const TopicListStruct = lrEnvelopes.topicList;
const xtend = require('xtend');
const purify = require('./purify');
const hljs = require('highlight.js');
const mailer = require('./mailer');


function updateSubscriptions(savedTopic) {
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

function notifyAdmins() {
  /*Topic.populate(savedTopic, details, function(err, detailedTopic) {
   if (err) {
   errorHandler(err);
   } else {
   var channel = 'topics:' + detailedTopic.category.slug;
   setTimeout(function() {
   io.emit(channel, TopicStruct(detailedTopic));
   }, 100
   );

   mailer({
   to: 'zoonman@gmail.com',
   subject: topic.title,
   html: '<div style="white-space: pre-line;">' + topic.body + '</div>' +
   '<hr>' +
   '<a href="' +
   'http://' + process.env.npm_package_config_server_name +
   '/' + detailedTopic.category.slug +
   '/' +
   '' + detailedTopic.slug +
   '">Открыть</a>'
   }
   );
   }
   }
   );
   */
}


function question(socket, io, errorHandler) {

  socket.on('topic.save', function(question, fn) {
        //errorHandler('we got topic!', topic);

        var topic = xtend({
          'title': 'Без названия',
          'body': '',
          'category': {_id: ''},
          private: false,
          acl: []
        }, question
        );


        topic.body = purify(topic.body, false, true);
        topic.title = purify(topic.title, true);


        if (topic._id) {
          topic.updated = Date.now();
          Topic
              .findByIdAndUpdate(topic._id, topic)
              .populate('category')
              .then(function(r) {
                console.log('rrrr', r);
                topic.updated = r.toObject().updated;
                topic.category = r.toObject().category;
                io.emit(
                    'topics',
                    TopicListStruct([topic])
                );
                socket.broadcast.emit(
                    'topics',
                    TopicListStruct([topic])
                );

                socket
                    .to('topic:' + topic.slug)
                    .emit(
                        'topic:' + topic.slug,
                        TopicStruct(topic)
                    );

                fn(TopicStruct(r));
              })
              .catch(function(reason) {
                errorHandler(reason);
                fn({error: reason});
              });
        } else {
          var newTopic = new Topic(topic);
          newTopic.user = socket.webUser;
          newTopic.save(function(err, savedTopic) {
                if (err) {
                  fn({error: err});
                  return errorHandler(err);
                } else {
                  fn(TopicStruct(savedTopic));

                  const details = [
                    {path: 'category'}
                  ];
                  updateSubscriptions(savedTopic);
                }
              }
          );
        }
      }
  );

  socket.on('topic.get', function(request, responseCallback) {
    if (socket.webUser) {
      Topic
          .findOne({user: socket.webUser._id, slug: request.slug || ''})
          .populate([
            {path: 'category'},
            {path: 'user',
              select: 'name picture slug online rank'},
            {path: 'acl',
              select: 'name picture slug online rank'}
          ])
          .then(function(topicInfo) {
            responseCallback({success: true, topic: topicInfo});
          })
          .catch(function(reason) {
            responseCallback({success: false, error: reason});
          });
    } else {
      responseCallback({success: false, error: 'Not Found'});
    }


  });
}

module.exports = question;
