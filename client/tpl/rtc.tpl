<div class="call" ng-class="{active: $ctrl.onCall, fullscreen: $ctrl.fullScreenIsEnabled}" id="callComponent">

  <div class="flex-column" ng-show="$ctrl.onCall">
    <div class="video" ng-repeat="stream in $ctrl.remoteStreams track by $index">
      <p>{{$index}}</p>
      <video id="remoteVideo" ng-src="{{stream}}" autoplay class="focused" ng-dblclick="$ctrl.enableFullScreen()"></video>

    </div>
  </div>

  <div class="footer flex-row">
    <div class="flex-column fg-pad" ng-show="$ctrl.onCall">
      <video id="localVideo" autoplay volume="0" ng-poster="{{$ctrl.topic.user.picture}}"></video>
    </div>

    <div class="controls flex-row">
      <div class="flex-row time" ng-show="$ctrl.onCall" lr-duration="$ctrl.callTime"></div>
      <div class="flex-column" ng-show="$ctrl.onCall">
        <a href="" ng-show="$ctrl.onCall" ng-click="$ctrl.muteAudio()">
          <i class="fa fa-fw fa-microphone" ng-show="$ctrl.audioIsEnabled"></i>
          <i class="fa fa-fw fa-microphone-slash" ng-hide="$ctrl.audioIsEnabled"></i>
        </a>
      </div>
      <div class="flex-column" ng-show="$ctrl.onCall">
        <a href="" ng-show="$ctrl.onCall" ng-click="$ctrl.muteVideo()">
            <span class="fa-stack fa-sm">
              <i class="fa fa-fw fa-video-camera fa-stack-1x" ></i>
              <i class="fa fa-ban fa-fw fa-stack-1x text-danger" ng-hide="$ctrl.videoIsEnabled"></i>
            </span>
        </a>
      </div>
      <div class="flex-column" ng-show="$ctrl.onCall">
        <a href="" ng-click="$ctrl.enableFullScreen()" >
          <i class="fa fa-fw fa-expand" ng-hide="$ctrl.fullScreenIsEnabled" title="{{'turn fullscreen mode on' | translate}}"></i>
          <i class="fa fa-fw fa-compress" ng-show="$ctrl.fullScreenIsEnabled" title="{{'turn fullscreen mode off' | translate}}"></i>
        </a>
      </div>
      <div class="flex-row" ng-hide="$ctrl.onCall">
        <div class="intro">
        </div>
        <a ng-href="/users/{{::aclu.member}}" ng-repeat="member in $ctrl.topic.conference track by member._id" title="{{::member.name}}">
          <img ng-src="{{::member.picture}}" class="img-responsive" alt="{{::member.name}}">
        </a>
        <p ng-bind="$ctrl.tooltip"></p>
      </div>
      <div class="flex-row">
        <a href="" ng-hide="$ctrl.onCall" ng-click="$ctrl.callIn()" class=" callin"
           tooltips
           tooltip-template="{{'join the call'|translate}}">
          <i class="fa fa-fw fa-2x fa-phone"></i>
        </a>
        <a href="" ng-show="$ctrl.onCall" ng-click="$ctrl.hangUp()" class="button hangup" ng-bind="'hang up'|translate"></a>
      </div>
    </div>
    <div class="fg-pad">&nbsp;</div>
  </div>
</div>
