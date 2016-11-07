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

const mongoose = require("mongoose");
const CommentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    body: {
        type: String
    },
    created: { type: Date, default: Date.now },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person'
    }
});

module.exports = mongoose.model('Comment', CommentSchema);
