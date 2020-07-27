const {Bookmark} = require('../schema');

module.exports = function(socket, handleError) {
  socket.on('bookmark', async (sreq, socketCallback) => {

        const { topic } = sreq;

        if (!topic) {
          return ;
        }

        const { webUser } = socket;
        if (!webUser) {
          return;
        }

        const { _id: user} = webUser;

        if (!user) {
          return;
        }

        const bookmark = await Bookmark
            .findOne({topic, user});

        if (!bookmark) {
          try {
            const newBookmark = new Bookmark({
                  topic,
                  user
                }
            );
            const savedBookmark = await newBookmark.save();
            return socketCallback({bookmarked: true});
          } catch (e) {
            socketCallback({bookmarked: false});
            return handleError(e);
          }
        }

        try {
          await bookmark.remove();
        } catch (e) {
          socketCallback({bookmarked: true});
          return handleError(e);
        }
      }
  );
};
