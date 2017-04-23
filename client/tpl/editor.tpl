<div class="toolbar">
  <a href="" ng-repeat="btn in $ctrl.toolbar"
      ng-class="{active: btn.active}"
      title="{{btn.hotKey}}"
      tooltips
      tooltip-append-to-body="true"
      tooltip-size="small"
      tooltip-template="{{btn.command|translate}}"
      class="format" ng-mousedown="$ctrl.t(btn.command, $event)">
    <i class="fa fa-fw fa-{{btn.fa}}"></i>
  </a>
  <span id="uploadEditorButton" class="format uploadEditorButton"
        tooltips
        tooltip-append-to-body="true"
        tooltip-size="small"
        tooltip-template="{{'upload'|translate}}"
  >
    <i class="fa fa-fw fa-paperclip"></i>
    <input type="file" id="upload_input" style="position: absolute;left: 0;top: 0;opacity: 0.001;width: 2em;">
  </span>

  <a class="format" style="float: right" ng-class="{active: enterKey}">
  &#8629;
  </a>

</div>

<div class="editor" contenteditable="true" ng-model="$ctrl.html" placeholder="{{'Type here'|translate}}"></div>
