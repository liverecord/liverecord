/**
 * Created by zoonman on 11/5/16.
 */


// text
// post
// user
// attachments
// created
// updated
// public
// spam

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const CommentSchema = new mongoose.Schema(
    {
      topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic'
      },
      body: {
        type: String
      },
      created: {type: Date, default: Date.now},
      updated: {type: Date, default: Date.now},
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        default: 0
      },
      deleted: {
        type: Boolean,
        default: false
      },
      solution: {
        type: Boolean,
        default: false
      },
      spam: {
        type: Boolean,
        default: false
      },
      moderated: {
        type: Boolean,
        default: false
      },
      classification: [
        {
          label: String,
          value: Number
        }
      ]
    });
CommentSchema.index({topic: 1});
CommentSchema.index({user: 1});
CommentSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Comment', CommentSchema);
