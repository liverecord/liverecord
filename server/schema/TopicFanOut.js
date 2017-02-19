/**
 * Created by zoonman on 11/5/16.
 */


const mongoose = require('mongoose');
const TopicFanOutSchema = new mongoose.Schema({
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  viewed: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
  commented: {type: Boolean, default: false},
  updates: {
    type: Number,
    default: 0
  }
}
);
TopicFanOutSchema.index({user: 1, topic: 1}, {unique: true});

module.exports = mongoose.model('TopicFanOut', TopicFanOutSchema);
