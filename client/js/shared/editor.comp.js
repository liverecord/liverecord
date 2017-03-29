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

function editorController($rootScope, $scope, socket, $timeout) {
  var self = this;

  self.listenKeyStrokes = function($evt) {
    console.log($evt)

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

          $timeout(function() {
            self.saveCard();
          }, 100);

          break;
      }
    }
  };

  self.formatDoc = function(command) {

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
      case 'pre':
      case 'blockquote':
      case 'code':
        getContentDocument().execCommand('formatBlock', false, command);
        break;

      default:
        getContentDocument().execCommand(command, false);
    }
  };
}

app.component('lrEditor', {
  templateUrl: '../../tpl/editor.tpl',
  controller: editorController,
  bindings: {
    topic: '=',
    user: '='
  }
});
