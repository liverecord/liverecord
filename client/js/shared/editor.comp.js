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

  self.toolbar = [
    {active: true, command: 'bold', fa: 'bold', hotKey: 'Ctrl+B'},
    {active: false, command: 'italic', fa: 'italic', hotKey: 'Ctrl+I'},
    {active: false, command: 'underline', fa: 'underline', hotKey: 'Ctrl+B'},

    {active: false, command: 'insertOrderedList', fa: 'list-ol', hotKey: 'Ctrl+Shift+;'},
    {active: false, command: 'insertUnorderedList', fa: 'list-ul', hotKey: 'Ctrl+Shift+L'},

    {active: false, command: 'picture', fa: 'picture-o', hotKey: ''},
    {active: false, command: 'link', fa: 'link', hotKey: ''},


    {active: false, command: 'code', fa: 'code', hotKey: ''},
    {active: false, command: 'kbd', fa: 'keyboard-o', hotKey: ''},
    {active: false, command: 'blockquote', fa: 'quote-left', hotKey: ''},
    {active: false, command: 'subscript', fa: 'subscript', hotKey: ''},
    {active: false, command: 'superscript', fa: 'superscript', hotKey: ''},

    {active: false, command: 'createLink', fa: 'link', hotKey: ''},
    {active: false, command: 'unlink', fa: 'chain-broken', hotKey: ''},

    {active: false, command: 'removeFormat', fa: 'eraser', hotKey: ''},
    {active: false, command: 'insertParagraph', fa: 'paragraph', hotKey: ''},
  ];

  var getContentDocument = function() {
    return document;
  };


  function refreshState() {
    self.toolbar.map(function(item) {
      item.active = getContentDocument().queryCommandState(item.command)
    })

  }

  function wrapSelection(prefix, suffix) {
    suffix = suffix || prefix;
    var textArea = document.querySelector('div.editor');
    //var textLength = textArea.value.length;
    /*var selectionStart = textArea.selectionStart;
    var selectionEnd = textArea.selectionEnd;
    var sel = textArea.value.substring(selectionStart, selectionEnd);
   var replace = '' + prefix + '' + sel.trim() + '' + suffix + '';
    $scope.commentText = textArea.value.substring(0, selectionStart) +
        replace +
        textArea.value.substring(selectionEnd, textLength);
        */
    var selection = document.getSelection(), newHtml = '';
    console.log('s', selection);
    if (selection.isCollapsed) {
      newHtml = prefix  + '&nbsp;'+ suffix;
    } else {
      newHtml = prefix  + selection.toString() + suffix;
    }
    getContentDocument().execCommand('insertHTML', false,
    newHtml);
  }

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
            //self.saveCard();
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
    document.querySelector('.editor').focus();

    self.formatDoc(cmd);
  } ;

  self.keyUpHandler = function() {
    refreshState();
  };
}

app.component('lrEditor', {
  templateUrl: '../../tpl/editor.tpl',
  controller: editorController,
  bindings: {
    html: '='
  }
});
