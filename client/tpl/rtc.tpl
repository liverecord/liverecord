<div class="call">
  <div class="flex-row">
    <div class="flex-row">
      <div class="intro">
        {{'join the call'|translate}}
      </div>
      <a ng-href="/users/{{::aclu.member}}" ng-repeat="member in $ctrl.topic.conference track by member._id"  title="{{::member.name}}">
        <img ng-src="{{::member.picture}}" class="img-responsive" alt="{{::member.name}}">
      </a>
      <p>{{$ctrl.tooltip}}</p>
    </div>
    <div class="controls">
      <div class="flex-row">
        <a href="" ng-hide="$ctrl.onCall" ng-click="$ctrl.callIn()" class="button callin">
          <i class="fa fa-fw fa-phone"></i>
          {{'call in'|translate}}
        </a>





        <a href="" ng-show="$ctrl.onCall" ng-click="$ctrl.hangUp()" class="button hangup">{{'hang up'|translate}}</a>
      </div>
    </div>
  </div>
  <div class="flex-row" ng-show="$ctrl.onCall">
    <div class="flex-column">
      <p>Local

        <span>{{$ctrl.callTime|date:'m:ss'}}</span>

        <a href="" ng-show="$ctrl.onCall" ng-click="$ctrl.muteAudio()" >
          <i class="fa fa-fw fa-microphone" ng-show="$ctrl.audioIsEnabled"></i>
          <i class="fa fa-fw fa-microphone-slash" ng-hide="$ctrl.audioIsEnabled"></i>
        </a>


        <a href="" ng-show="$ctrl.onCall" ng-click="$ctrl.muteVideo()" >
          <span class="fa-stack fa-sm">
            <i class="fa fa-fw fa-video-camera fa-stack-1x" ></i>
            <i class="fa fa-ban fa-fw fa-stack-1x " ng-hide="$ctrl.videoIsEnabled" style="color: grey"></i>
          </span>
        </a>

      </p>
      <video id="localVideo" autoplay volume="0"></video>
    </div>
    <div class="flex-column">
      <p>Remote</p>
      <video id="remoteVideo" autoplay controls></video>
    </div>
  </div>
</div>
