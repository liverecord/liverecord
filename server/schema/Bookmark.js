
const mongoose = require("mongoose");
const TopicBookmarkSchema = new mongoose.Schema({
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    created: { type: Date, default: Date.now },
    order: {
        type: Number,
        default: 0
    }
});
TopicBookmarkSchema.index({user: 1, topic: 1}, {unique: true});

module.exports = mongoose.model('Bookmark', TopicBookmarkSchema);
