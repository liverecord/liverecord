/**
 * Created by zoonman on 11/23/16.
 */

exports.topicList = function(data, verb) {
  return {
      type: 'topicList',
      verb: verb ? verb : 'add',
      data: data
  }
};


exports.topic = function(data, verb) {
    return {
        type: 'topic',
        verb: verb ? verb : 'add',
        data: data
    }
};


exports.comment = function(data, verb) {
    return {
        type: 'comment',
        verb: verb ? verb : 'add',
        data: data
    }
};

exports.commentList = function(data) {
    return {
        type: 'commentList',
        data: data
    }
};

exports.typing = function(data) {
    return {
        type: 'typing',
        data: data
    }
};
