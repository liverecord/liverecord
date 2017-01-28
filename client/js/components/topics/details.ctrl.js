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

        /*
        var getScrollTopMax = function() {
          var ref;
          return (ref = document.scrollingElement.scrollTopMax) != null ? ref :
            (document.scrollingElement.scrollHeight - document.documentElement.clientHeight);
        };
*/
        function isVisible(keyCode) {
          return ([8, 9, 13].indexOf(keyCode) || (keyCode > 46 && keyCode));
        }

        /*function array_id_merge(firstArray, secondArray) {
          var items = [], newItems = [];
          items = items.concat(firstArray);
          items = items.concat(secondArray);

          var extractValueToCompare = function(item) {
            if (angular.isObject(item)) {
              return item['_id'];
            } else {
              return item;
            }
          };

          angular.forEach(items, function(item) {
                var isDuplicate = false;
                for (var i = 0; i < newItems.length; i++) {
                  var a = extractValueToCompare(newItems[i]);
                  var b = extractValueToCompare(item);
                  if (angular.equals(a, b)) {
                    isDuplicate = true;
                  }
                }
                if (!isDuplicate) {
                  newItems.push(item);
                }
              }
          );
          items = newItems;
          return items;
        }*/

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
                  $scope.comments = $scope.comments.concat(envelope.data);
                  $timeout($anchorScroll, 100);

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

                  break;
                case 'comment':
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

                        $scope.typists = array_id_remove($scope.typists,
                            envelope.data.user._id
                        );

                      }, 100
                  );
                  break;

                case 'topic':
                  $scope.topic = angular.copy(envelope.data);
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

            }
        );

        socket.emit('subscribe', {
              type: 'topic',
              slug: $routeParams.topic
            }
        );

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
          var kc = evt.which ? evt.which : evt.keyCode, isSafari = navigator.userAgent.toLowerCase()
                  .indexOf("safari") != -1;
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
                range.moveStart("character", start);
                range.moveEnd("character", end - start);
                range.select();
              }
            }

            var tablen = 1, tab = '\t', tab_regexp = /\n\t/g;
            var ss = t.selectionStart, se = t.selectionEnd, ta_val = t.value, sel = ta_val.slice(
                ss,
                se
            );
            shft = (isSafari && kc == 25) || evt.shiftKey;
            var was_tab = ta_val.slice(ss - tablen,
                    ss
                ) == tab, starts_with_tab = ta_val.slice(ss,
                    ss + tablen
                ) == tab, offset = shft ? 0 - tablen : tablen, full_indented_line = false, num_lines = sel.split(
                "\n"
            ).length;

            if (ss != se && sel[sel.length - 1] == '\n') {
              se--;
              sel = ta_val.slice(ss, se);
              num_lines--;
            }
              if (num_lines == 1 && starts_with_tab) {
                  full_indented_line = true;
              }

            if (!shft || was_tab || num_lines > 1 || full_indented_line) {
              // multi-line selection
              if (num_lines > 1) {
                // tab each line
                if (shft && (was_tab || starts_with_tab) && sel.split(tab_regexp).length == num_lines) {
                    if (!was_tab) {
                        sel = sel.substring(tablen);
                    }
                  t.value = ta_val.slice(0, ss - (was_tab ? tablen : 0))
                      .concat(sel.replace(tab_regexp, "\n"))
                      .concat(ta_val.slice(se, ta_val.length));
                  ss += was_tab ? offset : 0;
                  se += offset * num_lines;
                }
                else if (!shft) {
                  t.value = ta_val.slice(0, ss)
                      .concat(tab)
                      .concat(sel.replace(/\n/g, "\n" + tab))
                      .concat(ta_val.slice(se, ta_val.length));
                  se += offset * num_lines;
                }
              }

              // single-line selection
              else {
                  if (shft) {
                      t.value = ta_val.slice(0,
                              ss - (full_indented_line ? 0 : tablen)
                          )
                          .concat(ta_val.slice(ss + (full_indented_line ? tablen : 0),
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

            setTimeout("var t=document.getElementById('" + t.id + "'); t.focus(); t.setSelectionRange(" + ss + ", " + se + ");",
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
          if (event.keyCode == 13 && (event.ctrlKey || event.metaKey || ($localStorage.sendCommentsCtrl === 'Enter' && !event.shiftKey)) && $scope.sendButtonActive) {
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
                $localStorage['topic_ct_' + $scope.topic._id] = $scope.commentText;
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

        try {
          var socketUploader = io.connect();
          var uploader = new SocketIOFileUpload(socketUploader);
          // uploader.maxFileSize = 1024 * 1024 * 10;
          uploader.listenOnInput(document.getElementById("siofu_input"));
          //uploader.listenOnDrop(document.getElementById("topic"));

          var commentElement = document.getElementById("comment");
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
                if (['jpg', 'jpeg', 'png', 'gif'].indexOf(payload.extension) > -1) {
                  // an image
                  text += '<img src="' + url + '" alt="' + payload.friendlyName + '"';
                  if (payload.hasAlpha) {
                    text += ' class="alpha"';
                  }
                  text += '>';
                } else {
                  text += payload.friendlyName;
                }
                text += '</a>\n';

                $scope.commentText = $scope.commentText + text;
                $scope.$applyAsync();
              }
          );
          uploader.addEventListener("error", function(data) {
                if (data.code === 1) {
                  alert("Используйте файлы не более 10 MB");
                }
                console.log('upload error', data)
                $rootScope.$applyAsync();
              }
          );
          uploader.addEventListener("start", function(event) {
                event.file.fIndex = $rootScope.notifications.add(event);
                $rootScope.$applyAsync();
              }
          );

          uploader.addEventListener("progress", function(event) {
                $rootScope.notifications.list[event.file.fIndex] = event;
                $rootScope.$applyAsync();
              }
          );
          uploader.addEventListener("load", function(event) {
                $rootScope.notifications.list[event.file.fIndex] = event;
                $rootScope.$applyAsync();
              }
          );
          uploader.addEventListener("complete", function(event) {
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

      }
    ]
);
