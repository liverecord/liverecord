const mongoose = require('mongoose');

const CommentVoteSchema = new mongoose.Schema({
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  },
  rating: {
    type: Number,
    default: 0
  }
});

CommentVoteSchema.index({user: 1, comment: 1}, {unique: true});
CommentVoteSchema.index({topic: 1});

module.exports = mongoose.model('CommentVote', CommentVoteSchema);
