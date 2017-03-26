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
        <a href="" ng-hide="$ctrl.onCall" ng-click="$ctrl.callIn()" class="button callin">{{'call in'|translate}}</a>
        <a href="" ng-show="$ctrl.onCall" ng-click="$ctrl.hangUp()"  class="button hangup">{{'hang up'|translate}}</a>
      </div>
    </div>
  </div>
  <div class="flex-row" ng-show="$ctrl.onCall">
    <div class="flex-column">
      <p>Local</p>
      <video id="localVideo" autoplay></video>
    </div>
    <div class="flex-column">
      <p>Remote</p>
      <video id="remoteVideo" autoplay></video>
    </div>
  </div>
</div>
