<div class="call" ng-class="{active: $ctrl.onCall, fullscreen: $ctrl.fullScreenIsEnabled}" id="callComponent">

  <div class="flex-column" ng-show="$ctrl.onCall">
    <div class="video">

      <video id="remoteVideo" autoplay class="focused"></video>
    </div>
  </div>

  <div class="footer flex-row">
    <div class="flex-column fg-pad" ng-show="$ctrl.onCall">
      <video id="localVideo" autoplay volume="0" ></video>
    </div>

    <div class="controls flex-row">
      <div class="flex-column time" ng-show="$ctrl.onCall">{{$ctrl.callTime|date:'m:ss'}}</div>
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
          <i class="fa fa-fw fa-expand"  ng-hide="$ctrl.fullScreenIsEnabled" title="{{'turn fullscreen mode on' | translate}}"></i>
          <i class="fa fa-fw fa-compress"  ng-show="$ctrl.fullScreenIsEnabled" title="{{'turn fullscreen mode off' | translate}}"></i>
        </a>
      </div>
      <div class="flex-row" ng-hide="$ctrl.onCall">
        <div class="intro">
          {{'join the call'|translate}}
        </div>
        <a ng-href="/users/{{::aclu.member}}" ng-repeat="member in $ctrl.topic.conference track by member._id"  title="{{::member.name}}">
          <img ng-src="{{::member.picture}}" class="img-responsive" alt="{{::member.name}}">
        </a>
        <p>{{$ctrl.tooltip}}</p>
      </div>
      <div class="flex-row">
        <a href="" ng-hide="$ctrl.onCall" ng-click="$ctrl.callIn()" class="button callin">
          <i class="fa fa-fw fa-phone"></i>
          {{'call in'|translate}}
        </a>
        <a href="" ng-show="$ctrl.onCall" ng-click="$ctrl.hangUp()" class="button hangup">{{'hang up'|translate}}</a>
      </div>
    </div>
    <div class="fg-pad">&nbsp;</div>
  </div>
</div>
