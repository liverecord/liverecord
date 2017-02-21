<div class="flex-column " style="width: 100%;">
  <div id="topic" style="position: relative">
    <div class="user-info flex-center">
      <h1>Пользователи</h1>
      <h3>Top-100</h3>
      <div class="list">
        <div class="item flex-row" ng-repeat="userInfo in users track by userInfo._id" style="margin-bottom: 1em">
          <div style="width: 2em;text-align: right">
            <span class="online" ng-show="userInfo.online" title="Онлайн"><i class="fa fa-circle"></i></span>

          </div>
          <div style="width: 80px;text-align: center">
            <a ng-href="/users/{{::userInfo.slug}}"><img ng-src="{{::userInfo.picture}}" alt="{{::userInfo.name}}" class="img-responsive" width="50" height="50"
              style="text-overflow: ellipsis;overflow: hidden;font-size: 0.5em"></a>
          </div>
          <div class="flex-col">
            <div style="text-align: left">
              <a ng-href="/users/{{::userInfo.slug}}" style="font-weight: 500;text-decoration: none">{{::userInfo.name}}</a>
            </div>
            <div style="text-align: left;font-size: 0.8em;color: grey"><kbd>@{{::userInfo.slug}}</kbd></div>
            <div style="width: 6em;text-align: left;font-size: 0.6em">
              <small>
              <span class="rank">
                <i class="fa fa-fw fa-stop" ng-class="{ranked: userInfo.rank > 0}"></i>&nbsp;
                <i class="fa fa-fw fa-stop" ng-class="{ranked: userInfo.rank > 1}"></i>&nbsp;
                <i class="fa fa-fw fa-stop" ng-class="{ranked: userInfo.rank > 2}"></i>&nbsp;
                <i class="fa fa-fw fa-stop" ng-class="{ranked: userInfo.rank > 3}"></i>&nbsp;
                <i class="fa fa-fw fa-stop" ng-class="{ranked: userInfo.rank > 4}"></i>
              </span>
                </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
