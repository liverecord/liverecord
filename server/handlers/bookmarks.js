/**
 * Created by zoonman on 11/19/16.
 */
const Bookmark = require('../schema').Bookmark;
const xtend = require('xtend');

module.exports = function(socket, handleError) {
  socket.on('bookmark', function(sreq, socketCallback) {

        sreq = xtend({
          'topic': ''
        }, sreq
        );

        Bookmark
            .findOne({topic: sreq.topic, user: socket.webUser})
            .then(function(bookmark) {
                  if (bookmark) {
                    bookmark
                        .remove()
                        .then(function() {
                              socketCallback({bookmarked: false});
                            }
                        ).catch(function(reason) {
                          socketCallback({bookmarked: false});
                          handleError(reason);
                        }
                    );
                  } else {
                    let newBookmark = new Bookmark({
                      topic: sreq.topic,
                      user: socket.webUser
                    }
                    );
                    newBookmark
                        .save()
                        .then(function(savedBookmark) {
                              socketCallback({bookmarked: true});
                            }
                        )
                        .catch(function(reason) {
                              socketCallback({bookmarked: false});
                              handleError(reason);
                            }
                        );
                  }
                }
            )
            .catch(function(reason) {
                  socketCallback({bookmarked: false});
                  handleError(reason);
                }
            );
      }
  );
};
