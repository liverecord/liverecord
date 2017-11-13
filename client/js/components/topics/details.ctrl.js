/**
 * Created by zoonman on 11/27/16.
 */

app.controller(
    'TopicDetailsController',
    ['socket',
      '$anchorScroll',
      '$scope',
      'CategoriesFactory',
      '$routeParams',
      '$timeout',
      '$translate',
      'PerfectScrollBar',
      '$localStorage',
      '$location',
      '$rootScope',
      '$route',
      '$document',
      '$sce',
      'Socialshare',
      'wpf',

      function(socket,
          $anchorScroll,
          $scope,
          CategoriesFactory,
          $routeParams,
          $timeout,
          $translate,
          PerfectScrollBar,
          $localStorage,
          $location,
          $rootScope,
          $route,
          $document,
          $sce,
          SocialShare,
          wpf) {

        const ENTER_KEY_CODE = 13;
        const TAB_KEY_CODE = 9;

        //
        //var socketUploader;
        $scope.sending = false;
        $scope.comments = [];
        $scope.typists = [];
        $scope.uploadStatus = '';
        $scope.commentText = '';
        $scope.advancedCompose = false;
        $scope.sendButtonActive = false;
        $scope.initialCommentsLoad = true;
        $scope.pagination = {page: 0, total: 0, pages: 0, limit: 10};
        $scope.$localStorage = $localStorage;
        $scope.socialshareAttrs = {
          provider: 'email'
        };
        $scope.share = {
          provider: 'email'
        };
        var typingTimeouts = {};
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

        function restoreFocus() {
          $timeout(
              function() {document.querySelector('div.editor').focus();},
              1
          );
        }

        function scrollToAnchor(anchorId) {
          var el = document.getElementById(anchorId);
          if (el) {
            el.scrollIntoView();
          }
        }

        function actualUpdateTopicHeight() {
          'use strict';
          var composeEl = document.querySelector('div.compose');
          var headerEl = document.querySelector('div.header');
          var topicCont = document.getElementById('topic');
          if (topicCont && composeEl) {
            topicCont.style.height = (
                window.innerHeight - composeEl.clientHeight - headerEl.clientHeight
            ) + 'px';
            console.log('topicCont.style.height', topicCont.style.height)
            if (topicCont && Ps) {
              if (topicCont.hasOwnProperty('scrollTopMax')) {
                topicCont.scrollTop = topicCont.scrollTopMax;
              } else {
                /*var c = document.getElementById('commentsList');
                 if (c && c.lastElementChild) {
                 c.lastElementChild.scrollIntoView();
                 }*/
                scrollToAnchor('topicAnchor');
              }
              Ps.update(topicCont);
            }
          }
        }
        function updateTopicHeight() {
          actualUpdateTopicHeight();
          // allow animation do it's business
          $timeout(actualUpdateTopicHeight, 200);
        }

        function scrollElementIntoView(elId) {
          var el = document
              .getElementById(elId);
          if (el) {
            el.scrollIntoView();
          }
        }

        function scrollToLatestComment() {
          $timeout(function() {
            if ($scope.initialCommentsLoad) {
              if ($scope.topic &&
                  $scope.topic.fanOut &&
                  $scope.comments &&
                  $scope.topic.fanOut.viewed && $scope.comments.length > 0) {
                var commentId = '', cl = $scope.comments.length;
                var i = cl - 1;
                //
                while (i >= 0) {
                  // console.log(
                  // 'i', i, 'fanOut', $scope.topic.fanOut.viewed,
                  // 'created', $scope.comments[i].created)
                  var fanOutViewed = new Date($scope.topic.fanOut.viewed);
                  var commentCreated = new Date($scope.comments[i].created);
                  if (
                      fanOutViewed < commentCreated ||
                      i === 0
                  ) {
                    commentId = $scope.comments[i]._id;
                    scrollElementIntoView('comment_' + commentId);
                    $scope.initialCommentsLoad = false;
                    break;
                  }
                  i--;
                }
              }
            }
            scrollElementIntoView('topic_list_id_' + $scope.topic._id);
          }, 50);
        }


        function trust(item, prop) {
          if (item[prop] && typeof item[prop] === 'string') {
            item[prop] = $sce.trustAsHtml(item[prop] || '');
          }
        }

        function trustAttachments(item) {
          if (item.attachments && Array.isArray(item.attachments)) {
            item.attachments.map(function(a) {
              trust(a, 'html');
            });
          }
        }

        /**
         *
         * @param {array} scopeComments
         * @param {array} newComments
         */
        function addComments(scopeComments, newComments) {
          var coms = array_id_merge(
              scopeComments,
              newComments
          );
          coms.sort(function(a, b) {
            var ad = new Date(a.updated), bd = new Date(b.updated);
            return ad.getTime() > bd.getTime();
          });

          coms.map(function(i) {
            trust(i, 'body');
            trustAttachments(i);
          });

          var cntr = 0, hide = false;
          coms.forEach(function(cv, index) {
            var cd = new Date(cv.updated);

            if (index > 0) {
              // next element
              var pd = new Date(coms[index - 1].updated);
              if (cd.getTime() - pd.getTime() > 3600) {
                cntr = 0;
                hide = false;
              }
              if (cv.user._id === coms[index - 1].user._id) {
                cntr++;
                hide = true;
                if (cntr > 3) {
                  cntr = 0;
                  hide = false;
                }
              } else {
                cntr = 0;
                hide = false;
              }
            } else {
              cntr = 0;
              hide = false;
            }
            cv.hide = hide;
          });
          return coms;
        }

        socket.on('topic:' + $routeParams.topic, function(envelope) {
              console.log('topic:envelope', envelope);

              switch (envelope.type) {
                case 'commentList':
                  $scope.comments = addComments(
                      $scope.comments,
                      envelope.data.docs
                  );
                  if (envelope.data.pages) {
                    $scope.pagination.total = envelope.data.total || 0;
                    $scope.pagination.pages = envelope.data.pages || 0;
                    $scope.pagination.page = envelope.data.page || 1;
                  }
                  if ($location.hash()) {
                    $timeout($anchorScroll, 100);
                  }
                  PerfectScrollBar.setup('topic');
                  scrollToLatestComment();
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
                  /*envelope.data.body = $sce.trustAsHtml(
                      envelope.data.body || ''
                  );*/
                  //trust(envelope.data, 'body');
                  //trustAttachments(envelope.data);

                  //$scope.comments.unshift(envelope.data);

                  $scope.comments = addComments(
                      $scope.comments,
                      [envelope.data]
                  );

                  $timeout(function() {
                    if (envelope.data._id) {
                      $location.hash('comment_' + envelope.data._id, false);
                    }
                    restoreFocus();


                    updateTopicHeight();

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
                  $scope.topic.absoluteUrl = window.location;
                  PerfectScrollBar.setup('topic');
                  $rootScope.messages = array_id_merge($rootScope.messages,
                      [envelope.data],
                      $routeParams.topic
                  );
                  $document[0].title = $scope.topic.title;
                  $scope.commentText = $localStorage['topic_ct_' + $scope.topic._id] || '';
                  $rootScope.$applyAsync();
                  scrollToLatestComment();

                  break;
              }
              updateTopicHeight();
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
          if (!comment.voted) {
            switch (action) {
              case 'up':
                comment.rating = (comment.rating || 0) + 1;
                comment.voted = true;
                break;
              case 'down':
                comment.rating = (comment.rating || 0) - 1;
                comment.voted = true;
                break;
              case 'solution':
                if ($scope.topic.user._id === $rootScope.user._id) {
                  comment.solution = ! comment.solution;
                } else {
                  return;
                }
                break;
            }
          }
          socket.emit('vote', {
                type: 'comment',
                comment: comment,
                action: action
              }
          );
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


        $scope.switchAdvancedCompose = function() {
          $scope.advancedCompose = !$scope.advancedCompose;
          updateTopicHeight();
          restoreFocus();
        };

        var lastKeyPress = 0;

        function getTimestamp() {
          return (+new Date()) / 1000;
        }

        $scope.commentKeyDown = function(event) {
          console.log('keypress:', event, arguments);


          switch (event.keyCode) {
            case ENTER_KEY_CODE:
              if ((event.ctrlKey || event.metaKey ||
                  ($localStorage.sendCommentsCtrl === 'Enter' && !event.shiftKey)) &&
                  $scope.sendButtonActive) {
                //
                $scope.sendComment();
              }
              updateTopicHeight();
              break;
            case TAB_KEY_CODE:
              break;
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
                if (!$scope.advancedCompose) {
                  if (newValue.indexOf('\n') > 0 || newValue.length > 80) {
                    $scope.advancedCompose = true;

                    $timeout(function() {
                      PerfectScrollBar.setup('topic');

                      $timeout(function() {
                        var c = document.getElementById('topicAnchor');
                        if (c) {
                          c.scrollIntoView();
                        }}, 150);
                    }, 50);

                  }

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
                  $timeout(function() {
                    $scope.sending = false;
                    restoreFocus();
                    wpf.subscribe();
                  }, 300);

                  $scope.commentText = '';
                  console.log(confirmation);

                  //$location.path('/' + $scope.topic.category.slug);
                }
            );
          }
        };

        window.addEventListener('resize', function() {
          PerfectScrollBar.setup('topic');
          updateTopicHeight();
        });

        $scope.$on('$destroy', function(event) {
          socket.off('topic:' + $routeParams.topic);
        });

        console.log('details controller loaded...');
      }
    ]
);
