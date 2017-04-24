/**
 * Created by zoonman on 3/22/17.
 *
 */

/**
 *
 *
 * @param {object} $rootScope
 * @param {object} $scope
 */

function editorController($rootScope, $scope, socket, $timeout, $sanitize) {
  var self = this;
  self.toolbar = [
    {active: true,  command: 'bold', fa: 'bold', hotKey: 'Ctrl+B'},
    {active: false, command: 'italic', fa: 'italic', hotKey: 'Ctrl+I'},
    {active: false, command: 'underline', fa: 'underline', hotKey: 'Ctrl+B'},

    {active: false, command: 'insertOrderedList', fa: 'list-ol', hotKey: 'Ctrl+Shift+;'},
    {active: false, command: 'insertUnorderedList', fa: 'list-ul', hotKey: 'Ctrl+Shift+L'},

    {active: false, command: 'picture', fa: 'picture-o', hotKey: ''},
    {active: false, command: 'createLink', fa: 'link', hotKey: ''},
    {active: false, command: 'unlink', fa: 'chain-broken', hotKey: ''},

    {active: false, command: 'code', fa: 'code', hotKey: ''},
    {active: false, command: 'kbd', fa: 'keyboard-o', hotKey: ''},
    {active: false, command: 'blockquote', fa: 'quote-left', hotKey: ''},
    {active: false, command: 'subscript', fa: 'subscript', hotKey: ''},
    {active: false, command: 'superscript', fa: 'superscript', hotKey: ''},

    {active: false, command: 'indent', fa: 'indent', hotKey: ''},
    {active: false, command: 'outdent', fa: 'outdent', hotKey: ''},


    {active: false, command: 'removeFormat', fa: 'eraser', hotKey: ''},
    {active: false, command: 'insertParagraph', fa: 'paragraph', hotKey: ''},

  ];
  self.editorUploader = {progress : 0};
  var getContentDocument = function() {
    return document;
  };


  function refreshState() {
    if (document.activeElement === document.querySelector('div.editor')) {
      self.toolbar.map(function(item) {
        item.active = getContentDocument().queryCommandState(item.command)
      });
    }
  }

  function wrapSelection(prefix, suffix) {
    suffix = suffix || prefix;
    var textArea = document.querySelector('div.editor');
    var selection = document.getSelection(), newHtml = '';
    if (selection.isCollapsed) {
      newHtml = prefix  + '&nbsp;'+ suffix;
    } else {
      newHtml = prefix  + selection.toString() + suffix;
    }
    getContentDocument().execCommand('insertHTML', false,
    newHtml);
  }

  // @todo refactor to something more reliable
  self.listenKeyStrokes = function($evt) {
    console.log('self.listenKeyStrokes', $evt)
    if ($evt.ctrlKey || $evt.metaKey) {
      switch ($evt.key) {
        case 'b':
          $evt.preventDefault();
          self.formatDoc('bold');
          break;
        case 'i':
          $evt.preventDefault();
          self.formatDoc('italic');
          break;
        case 'u':
          $evt.preventDefault();
          self.formatDoc('underline');
          break;
        case 'd':
          $evt.preventDefault();
          self.formatDoc('removeFormat');
          break;
        case 'p':
          $evt.preventDefault();
          self.formatDoc('insertParagraph');
          break;
        case 'e':
          $evt.preventDefault();
          self.formatDoc('justifyCenter');
          break;
        case ';':
          $evt.preventDefault();
          self.formatDoc('insertOrderedList');
          break;
        case 'l':
          $evt.preventDefault();
          if ($evt.shiftKey) {
            self.formatDoc('insertUnorderedList');
          } else {
            self.formatDoc('justifyLeft');
          }
          break;
        case 'r':
          $evt.preventDefault();
          self.formatDoc('justifyRight');
          break;
        case 'j':
          $evt.preventDefault();
          self.formatDoc('justifyFull');
          break;
        case ']':
          $evt.preventDefault();
          self.formatDoc('indent');
          break;
        case '[':
          $evt.preventDefault();
          self.formatDoc('outdent');
          break;
        case 's':
          $evt.preventDefault();
          break;
      }
    }

    if ($evt) {
      self.kp({value: $evt});
    }

  };

  self.formatDoc = function(command) {
    document.querySelector('.editor').focus();

    switch (command) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        var r = getContentDocument().execCommand('heading', false, command);
        if (r === false) {
          // wrapSelectionWithTag(command);
        }
        break;
      case 'code':
      case 'kbd':
        wrapSelection('<'+command+'>', '</'+command+'>');
        break;
      case 'pre':
      case 'blockquote':
        getContentDocument().execCommand('formatBlock', false, command);
        break;
      case 'createLink':
        var link = prompt('Url');
        if (link) {
          getContentDocument().execCommand(command, false, link);
        }
        break;
      default:
        getContentDocument().execCommand(command, false);
    }
    refreshState();
  };

  self.t = function(cmd, evt) {
    if (evt) {
      evt.preventDefault();
    }

    self.formatDoc(cmd);
  } ;

  self.clickHandler = function(evt) {
    refreshState();
  }
  self.keyupHandler = function(evt) {
    refreshState();
  }
  self.focusHandler = function(evt) {
    refreshState();
  }
  self.keydownHandler = function(evt) {
    refreshState();
    if (evt) {
      self.listenKeyStrokes(evt);
    }
  };

  var uploader = null;
  function getBodyElement() {
    return document.querySelector('body');
  }

  var setupUploader = function() {
    try {
      console.log('io.connect');
      //socketUploader = io.connect();

      uploader = new SocketIOFileUpload(socket.self);
      // uploader.maxFileSize = 1024 * 1024 * 10;
      //
      //
      $timeout(function() {
        var fe = document.querySelector('#uploadEditorFileInput');
        if (fe) {
          uploader.listenOnInput(fe);
        }
      }, 200);

      var commentElement = getBodyElement();
      if (commentElement) {
        uploader.listenOnDrop(commentElement);
      }


      var acceptObject = function(event) {
        console.log('acceptObject', event.dataTransfer.types)
        if (event.dataTransfer.types.indexOf('Files') > -1) {
          $scope.$applyAsync(function() {
            commentElement.style.cursor = 'copy';
            commentElement.style.backgroundColor = '#81A5D4';
            commentElement.classList.add('upload-accept');
            event.dataTransfer.dropEffect = 'copy';
          });
        } else {
          event.preventDefault();
        }
      };
      var declineObject = function(event) {
        commentElement.style.cursor = 'none';
        commentElement.style.backgroundColor = '';
        commentElement.classList.add('upload-decline');
      };
      var restoreTarget = function(event) {

        $scope.$applyAsync(function() {
          'use strict';
          commentElement.style.cursor = 'default';
          commentElement.style.backgroundColor = '';
          commentElement.classList.remove('upload-accept');
          commentElement.classList.remove('upload-decline');

        });
      };

      commentElement.addEventListener('dragenter', acceptObject);
      commentElement.addEventListener('dragover', acceptObject);
      commentElement.addEventListener('dragleave', restoreTarget);
      commentElement.addEventListener('drop', restoreTarget);
      commentElement.addEventListener('dragend', restoreTarget);
      commentElement.addEventListener('dragexit', restoreTarget);

      var processUploadedFile = function(payload) {
        console.log(payload);
        var url = '/' + payload.absolutePath.replace(/^\//, '');

        var text = '\n<br>';

        const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];
        if (IMAGE_EXTENSIONS.indexOf(payload.extension) > -1) {
          // an image
          text += '<img src="' + url + '" alt="' +
              payload.friendlyName + '"';
          if (payload.hasAlpha) {
            text += ' class="alpha"';
          }
          text += '>';
        } else if (payload.extension === 'mp4') {
          text += '<video src="' + url + '"';
          text += ' preload="metadata" controls> Play video ' +
              payload.friendlyName + '</video>';
        } else {
          text += '\n<a href="' + url + '">';
          text += payload.friendlyName;
          text += '</a>\n';
        }
        document.querySelector('.editor').focus();

        getContentDocument().execCommand('insertHTML', false, text);

        $scope.$applyAsync();
      };

      $scope.$on('$destroy', function(event) {
        'use strict';
        commentElement.removeEventListener('dragenter', acceptObject);
        commentElement.removeEventListener('dragover', acceptObject);
        commentElement.removeEventListener('dragleave', restoreTarget);
        commentElement.removeEventListener('drop', restoreTarget);
        commentElement.removeEventListener('dragend', restoreTarget);
        commentElement.removeEventListener('dragexit', restoreTarget);

        socket.off('file.uploaded', processUploadedFile);
        uploader.destroy();
      });

      //console.trace('file.uploaded')
      socket.on('file.uploaded', processUploadedFile);

      uploader.addEventListener('error', function(data) {
        if (data.code === 1) {
          alert('Используйте файлы не более 10 MB');
        }
        console.log('upload error', data);
        self.editorUploader.progress = 0;

      });

      uploader.addEventListener('start', function(event) {
        self.editorUploader.progress = 0;
      });

      uploader.addEventListener('progress', function(event) {
        if (event.file.size > 0) {
          self.editorUploader.progress = (event.bytesLoaded / event.file.size * 100);
          console.log('progress:', self.editorUploader.progress);
          //$rootScope.$applyAsync();
          $scope.$applyAsync();
        }
      });

      uploader.addEventListener('load', function(event) {
        self.editorUploader.progress = 0;
      });
      uploader.addEventListener('complete', function(event) {
        self.editorUploader.progress = 0;
        $scope.$applyAsync();
      });
    }
    catch (e) {
      console.log('error!', e);
    }
  };

  var pasteHandler = function(e) {
    if (e.clipboardData.types.indexOf('text/html') > -1) {
      e.preventDefault();// prevent pasting
      var s = e.clipboardData.getData('text/html');
      // we prefer ideal cleanup
      if (window.DOMPurify && window.DOMPurify.isSupported) {
        s = DOMPurify.sanitize(s, {
              ALLOWED_TAGS: [
                'a', 'b', 'strong', 'i', 'em', 'q', 'kbd', 'span', 'sub', 'sup', 's',
                'img', 'video',
                'ol', 'ul', 'li',
                'p', 'br', 'blockquote', 'code', 'pre'
              ],

              ALLOWED_ATTR: [
                'lang',
                'language',
                'target',
                'href',
                'controls',
                'alt',
                'src'
              ]
            }
        ).trim();
      } else {
        s = $sanitize(s);
      }
      getContentDocument().execCommand('insertHTML', false, s);
    }
  };
  // correctly setup event handlers
  self.$onInit = function() {
    'use strict';
    document.addEventListener('paste', pasteHandler);
    if (! window.u) {
      setupUploader();
      window.u = true;
    }

    //$timeout(setupUploader, 1000);
  }
  self.$onDestroy = function() {
    'use strict';
    console.log('$onDestroy');
    document.removeEventListener('paste', pasteHandler);
    if (uploader) {
      uploader.destroy();
    }
    window.u = false;
  };



}

app.component('lrEditor', {
  templateUrl: '../../tpl/editor.tpl',
  controller: editorController,
  bindings: {
    html: '=',
    kp: '&'
  }
});
