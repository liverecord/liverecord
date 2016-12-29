/**
 * Created by zoonman on 11/23/16.
 */

exports.topicList = function(data) {
  return {
      type: 'topicList',
      data: data
  }
};


exports.topic = function(data) {
    return {
        type: 'topic',
        data: data
    }
};


exports.comment = function(data) {
    return {
        type: 'comment',
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
