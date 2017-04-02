<div class="toolbar">


  <a href="#" ng-repeat="btn in $ctrl.toolbar"
      ng-class="{active: btn.active}"
      title="{{btn.hotKey}}"
      class="format" ng-mousedown="$ctrl.t(btn.command, $event)">
    <i class="fa fa-fw fa-{{btn.fa}}"></i>
  </a>

  <span id="uploadEditorButton" class="format" style="position: relative"><i class="fa fa-fw fa-paperclip"></i>
          <input type="file" id="upload_input" style="position: absolute;left: 0;top: 0;opacity: 0.001;width: 2em;"></span>
</div>


</div>
<div class="editor" contenteditable="true" ng-model="$ctrl.html"></div>
