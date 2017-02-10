/**
 * Created by zoonman on 11/27/16.
 */

app.controller(
    'TopicDetailsCtrl',
    ['socket',
      '$anchorScroll',
      '$scope',
      'CategoriesFactory',
      '$routeParams',
      '$timeout',
      'PerfectScrollBar',
      '$localStorage',
      '$location',
      '$rootScope',
      '$route',
      '$document',
      '$sce',
      'Socialshare',
      function(socket,
          $anchorScroll,
          $scope,
          CategoriesFactory,
          $routeParams,
          $timeout,
          PerfectScrollBar,
          $localStorage,
          $location,
          $rootScope,
          $route,
          $document,
          $sce,
          SocialShare) {
        //
        var socketUploader;
        $scope.sending = false;
        $scope.comments = [];
        $scope.typists = [];
        $scope.uploadStatus = '';
        $scope.commentText = '';
        $scope.advancedCompose = false;
        $scope.sendButtonActive = false;
        $scope.pagination = {page: 0, total: 0, pages: 0, limit: 10};

        $scope.$localStorage = $localStorage;
        $scope.socialshareAttrs = {
          provider: 'email'
        };

        $scope.share = {
          provider: 'email'
        };

        var original = $location.hash;
        $location.hash = function(hash, reload) {
          if (reload === false) {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function() {
              $route.current = lastRoute;
              un();
            });
          }
          return original.apply($location, [hash]);
        };

        function isVisible(keyCode) {
          return ([8, 9, 13].indexOf(keyCode) || (keyCode > 46 && keyCode));
        }

        function array_id_remove(inputArray, id) {
          var items = [];
          items = inputArray.filter(function(item) {
            return item['_id'] !== id;
          });

          return items;
        }

        var typingTimeouts = {};

        socket.on('topic:' + $routeParams.topic, function(envelope) {
              console.log('topic:envelope', envelope);

              switch (envelope.type) {
                case 'commentList':
                  $scope.comments = $scope.comments.concat(envelope.data.docs);
                  $scope.comments.map(function(i) {
                    if (i.body && typeof i.body === 'string') {
                      i.body = $sce.trustAsHtml(i.body || '');
                    }
                  });
                  if (envelope.data.pages) {
                    $scope.pagination.total = envelope.data.total || 0;
                    $scope.pagination.pages = envelope.data.pages || 0;
                    $scope.pagination.page = envelope.data.page || 1;
                  }
                  $timeout($anchorScroll, 100);
                  PerfectScrollBar.setup('topic');
                  break;
                case 'typing':
                  $scope.typists = array_id_merge(
                      $scope.typists,
                      envelope.data
                  );
                  if (typingTimeouts[envelope.data._id]) {
                    $timeout.cancel(typingTimeouts[envelope.data._id]);
                  }
                  typingTimeouts[envelope.data._id] = $timeout(function() {
                    $scope.typists = array_id_remove($scope.typists,
                        envelope.data._id
                    );
                  }, 3000);
                  PerfectScrollBar.setup('topic');
                  break;
                case 'comment':
                  envelope.data.body = $sce.trustAsHtml(
                      envelope.data.body || ''
                  );
                  $scope.comments.unshift(envelope.data);
                  $timeout(function() {
                    if (envelope.data._id) {
                      $location.hash('comment_' + envelope.data._id, false);
                    }
                    setTimeout(
                        'document.getElementById(\'comment\').focus();',
                        1
                    );
                    var topicCont = document.getElementById('topic');
                    if (topicCont && Ps) {
                      if (topicCont.hasOwnProperty('scrollTopMax')) {
                        topicCont.scrollTop = topicCont.scrollTopMax;
                      } else {
                        var c = document.getElementById('commentsList');
                        if (c && c.lastElementChild) {
                          c.lastElementChild.scrollIntoView();
                        }
                      }
                      Ps.update(topicCont);
                    }

                    $localStorage.notifications = angular.merge(
                        {},
                        {newComment: {audio: true}},
                        $localStorage.notifications
                    );

                    if ($rootScope.user &&
                        envelope.data.user._id != $rootScope.user._id) {
                      if ($localStorage.notifications.newComment.audio) {
                        var ae = document.getElementById('audioNotifications');
                        if (ae.paused) {
                          ae.play();
                        }
                      }
                    }

                    $scope.typists = array_id_remove($scope.typists,
                        envelope.data.user._id
                    );
                  },
                  100);
                  break;

                case 'topic':
                  var ntopic = angular.copy(envelope.data);
                  ntopic.body = $sce.trustAsHtml(ntopic.body ||
                  '');
                  $scope.topic = ntopic;
                  PerfectScrollBar.setup('topic');
                  $rootScope.messages = array_id_merge($rootScope.messages,
                      [envelope.data],
                      $routeParams.topic
                  );
                  $document[0].title = $scope.topic.title;
                  $scope.commentText = $localStorage['topic_ct_' + $scope.topic._id] || '';
                  $rootScope.$applyAsync();

                  break;
              }
              $scope.$applyAsync();
            }
        );


        $scope.loadOlderComments = function(force) {
          if ($scope.pagination.page < $scope.pagination.total || force) {
            $scope.pagination.page++;
            socket.emit('subscribe', {
                  type: 'topic',
                  slug: $routeParams.topic,
                  page: $scope.pagination.page
                }
            );
          }
        };
        $scope.loadOlderComments(true);

        $scope.vote = function(comment, action) {
          socket.emit('vote', {
                type: 'comment',
                comment: comment,
                action: action
              }
          );
          if (!comment.voted) {
            comment.voted = true;
            switch (action) {
              case 'up':
                comment.rating = (comment.rating || 0) + 1;
                break;
              case 'down':
                comment.rating = (comment.rating || 0) - 1;
                break;
            }
          }
        };

        $scope.report = function(comment) {
          socket.emit('report', {
                type: 'comment',
                comment: comment
              }
          );
          comment.spam = true;
        };

        $scope.moderateComment = function(comment, action) {
          socket.emit('moderate', {
                type: 'comment',
                comment: comment,
                action: action
              }
          );
          comment.moderated = true;
          switch (action) {
            case 'spam':
              comment.spam = true;
              comment.moderated = true;
              break;
            case 'ok':
              comment.moderated = true;
              comment.spam = false;
              break;
          }

        };

        $scope.$on('$destroy', function(event) {
          socket.off('topic:' + $routeParams.topic);
          if (socketUploader) {
            socketUploader.disconnect();
          }
        }
        );

        $scope.switchAdvancedCompose = function() {
          $scope.advancedCompose = !$scope.advancedCompose;
        };

        function enableTextareaTabInsertion(t, evt) {
          var kc = evt.which ? evt.which : evt.keyCode,
              isSafari = navigator.userAgent.toLowerCase()
                  .indexOf('safari') != -1;
          if (kc == 9 || (isSafari && kc == 25)) {
            t.focus();
            // hack for ie
            if (!t.selectionStart) {
              var range = document.selection.createRange();
              var stored_range = range.duplicate();
              stored_range.moveToElementText(t);
              stored_range.setEndPoint('EndToEnd', range);
              t.selectionStart = stored_range.text.length - range.text.length;
              t.selectionEnd = t.selectionStart + range.text.length;
              t.setSelectionRange = function(start, end) {
                var range = this.createTextRange();
                range.collapse(true);
                range.moveStart('character', start);
                range.moveEnd('character', end - start);
                range.select();
              };
            }
            var tabLen = 1, tab = '\t', tabRegexp = /\n\t/g;
            var ss = t.selectionStart,
                se = t.selectionEnd,
                ta_val = t.value, sel = ta_val.slice(ss, se);
            var shft = (isSafari && kc == 25) || evt.shiftKey;
            var was_tab = ta_val.slice(ss - tabLen, ss) == tab,
                startsWithTab = ta_val.slice(ss, ss + tabLen) == tab,
                offset = shft ? 0 - tabLen : tabLen,
                fullIndentedLine = false,
                numLines = sel.split('\n').length;

            if (ss != se && sel[sel.length - 1] == '\n') {
              se--;
              sel = ta_val.slice(ss, se);
              numLines--;
            }
            if (numLines == 1 && startsWithTab) {
              fullIndentedLine = true;
            }
            if (!shft || was_tab || numLines > 1 || fullIndentedLine) {
              // multi-line selection
              if (numLines > 1) {
                // tab each line
                if (shft && (was_tab || startsWithTab) && sel.split(tabRegexp).length == numLines) {
                  if (!was_tab) {
                    sel = sel.substring(tabLen);
                  }
                  t.value = ta_val.slice(0, ss - (was_tab ? tabLen : 0))
                      .concat(sel.replace(tabRegexp, '\n'))
                      .concat(ta_val.slice(se, ta_val.length));
                  ss += was_tab ? offset : 0;
                  se += offset * numLines;
                }
                else if (!shft) {
                  t.value = ta_val.slice(0, ss)
                      .concat(tab)
                      .concat(sel.replace(/\n/g, '\n' + tab))
                      .concat(ta_val.slice(se, ta_val.length));
                  se += offset * numLines;
                }
              }
              // single-line selection
              else {
                if (shft) {
                  t.value = ta_val
                      .slice(0, ss - (fullIndentedLine ? 0 : tabLen))
                      .concat(
                          ta_val.slice(
                              ss + (fullIndentedLine ? tabLen : 0),
                              ta_val.length
                          )
                      );
                } else {
                  t.value = ta_val.slice(0, ss)
                      .concat(tab)
                      .concat(ta_val.slice(ss, ta_val.length));
                }
                if (ss == se) {
                  ss = se = ss + offset;
                } else {
                  se += offset;
                }
              }
            }
            setTimeout(
                'var t=document.getElementById(\'' + t.id +
                '\'); t.focus(); t.setSelectionRange(' + ss + ', ' + se + ');',
                0
            );
            evt.preventDefault();
            return false;
          }
        }

        var lastKeyPress = 0;

        function getTimestamp() {
          return (+new Date()) / 1000;
        }

        $scope.commentKeyDown = function(event) {
          console.log(event);
          if (event.keyCode == 13 &&
              (event.ctrlKey || event.metaKey ||
              ($localStorage.sendCommentsCtrl == 'Enter' && !event.shiftKey)) &&
              $scope.sendButtonActive) {
            //
            $scope.sendComment();
          } else if (event.keyCode == 9) {
            enableTextareaTabInsertion(event.target, event);
            event.preventDefault();
            event.stopPropagation();
          }
          var currentTimeStamp = getTimestamp();
          if (isVisible(event.keyCode) && currentTimeStamp - lastKeyPress > 2) {
            socket.emit('typing', {
                  type: 'typing',
                  slug: $routeParams.topic
                }
            );
            lastKeyPress = currentTimeStamp;
          }
        };

        $scope.$watch('commentText', function(newValue, oldValue) {
              if (newValue) {
                console.log(newValue);
                if (newValue.indexOf('\n') > 0 || newValue.length > 80) {
                  $scope.advancedCompose = true;
                }
                $scope.sendButtonActive = newValue.length >= 1;
                $localStorage['topic_ct_' + $scope.topic._id] = $scope
                    .commentText;
              } else {
                $scope.sendButtonActive = false;
                if ($localStorage['topic_ct_' + $scope.topic._id]) {
                  delete $localStorage['topic_ct_' + $scope.topic._id];
                }
              }

              return newValue;
            }
        );

        $scope.sendComment = function() {

          if (!$scope.sending) {
            $scope.sending = true;
            $scope.sendButtonActive = false;
            $scope.$applyAsync();
            socket.emit('comment', {
                  topic: $scope.topic,
                  body: $scope.commentText
                }, function(confirmation) {
                  $scope.sending = false;

                  $scope.commentText = '';
                  console.log(confirmation);

                  //$location.path('/' + $scope.question.category.slug);
                }
            );
          }
        };

        $scope.uploadFiles = [];
        $scope.uploadProgress = 0;

        try {
          socketUploader = io.connect();
          var uploader = new SocketIOFileUpload(socketUploader);
          // uploader.maxFileSize = 1024 * 1024 * 10;
          uploader.listenOnInput(document.getElementById('siofu_input'));
          //uploader.listenOnDrop(document.getElementById("topic"));

          var commentElement = document.getElementById('comment');
          uploader.listenOnDrop(commentElement);
          var acceptObject = function(event) {
            commentElement.style.cursor = 'copy';
            commentElement.style.backgroundColor = '#81A5D4';
          };
          var declineObject = function(event) {
            commentElement.style.cursor = 'none';
            commentElement.style.backgroundColor = '';
          };
          var restoreTarget = function(event) {
            commentElement.style.cursor = 'default';
            commentElement.style.backgroundColor = '';
          };

          commentElement.addEventListener('dragenter', function(event) {
                acceptObject(event);
              }
          );
          commentElement.addEventListener('dragover', function(event) {
                acceptObject(event);
              }
          );
          commentElement.addEventListener('dragleave', function(event) {
                restoreTarget(event);
              }
          );
          commentElement.addEventListener('drop', function(event) {
                restoreTarget(event);
              }
          );
          commentElement.addEventListener('dragend', function(event) {
                restoreTarget(event);
              }
          );
          commentElement.addEventListener('dragexit', function(event) {
                restoreTarget(event);
              }
          );



          socketUploader.on('file.uploaded', function(payload) {
                console.log(payload);
                var url = '/' + payload.absolutePath.replace(/^\//, '');

                var text = '\n<a href="' + url + '">';

                const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];
                if (IMAGE_EXTENSIONS.indexOf(payload.extension) > -1) {
                  // an image
                  text += '<img src="' + url + '" alt="' +
                      payload.friendlyName + '"';
                  if (payload.hasAlpha) {
                    text += ' class="alpha"';
                  }
                  text += '>';
                  text += '</a>\n';
                } else if (payload.extension === 'mp4') {
                  text += payload.friendlyName;
                  text += '</a>\n';
                  text += '<video src="' + url + '"';
                  text += ' preload="metadata" controls> Play video ' +
                      payload.friendlyName + '</video>';
                } else {
                  text += payload.friendlyName;
                  text += '</a>\n';
                }

                $scope.commentText = $scope.commentText + text;
                $scope.$applyAsync();
          });

          uploader.addEventListener('error', function(data) {
                if (data.code === 1) {
                  alert('Используйте файлы не более 10 MB');
                }
                console.log('upload error', data);
                $rootScope.$applyAsync();
                $scope.uploadProgress = 0;

              }
          );
          uploader.addEventListener('start', function(event) {
                event.file.fIndex = $rootScope.notifications.add(event);
            $scope.uploadProgress = 0;

            $rootScope.$applyAsync();
              }
          );

          uploader.addEventListener('progress', function(event) {
                $rootScope.notifications.list[event.file.fIndex] = event;
            console.log('upload progress', event)
            if (event.file.size > 0) {
              $scope.uploadProgress = event.bytesLoaded / event.file.size * 100;
            }


            $rootScope.$applyAsync();
              }
          );
          uploader.addEventListener('load', function(event) {
                $rootScope.notifications.list[event.file.fIndex] = event;
            $scope.uploadProgress = 0;

            $rootScope.$applyAsync();
              }
          );
          uploader.addEventListener('complete', function(event) {
                //delete $rootScope.notifications.list[event.file.fIndex];
                console.log('$rootScope.notifications.list',
                    $rootScope.notifications.list
                )
                $rootScope.$applyAsync();
              }
          );

        }
        catch (e) {
          console.error(e)
        }

        window.addEventListener('resize', function() {
          PerfectScrollBar.setup('topic');
        });

      }
    ]
);
