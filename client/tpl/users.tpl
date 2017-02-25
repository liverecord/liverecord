<div class="flex-column " style="width: 100%;">
  <div id="topic" style="position: relative">
    <div class="user-info flex-center">
      <h1>{{'Users' | translate}}</h1>
      <p class="text-center">{{'Top-100' | translate}}</p>

      <div class="flex-row flex-center">
        <ol class="list" type="1">
          <li ng-repeat="userInfo in users track by userInfo._id" style="color: rgba(0,0,0,0.2);font-weight: 100;font-size: 2em">
            <div class="item flex-row"  style="margin-bottom: 1em;font-size: 0.5em">
              <div style="width: 2em;text-align: right">
                <span class="online" ng-show="userInfo.online" title="{{'Online' | translate}}"><i class="fa fa-circle"></i></span>

              </div>
              <div style="width: 80px;text-align: center">
                <a ng-href="/users/{{::userInfo.slug}}"><img ng-src="{{::userInfo.picture}}" alt="{{::userInfo.name}}" class="img-responsive" width="50" height="50"
                  style="text-overflow: ellipsis;overflow: hidden;font-size: 0.5em"></a>
              </div>
              <div class="flex-col">
                <div style="text-align: left">
                  <a ng-href="/users/{{::userInfo.slug}}" style="font-weight: 500;text-decoration: none">{{::userInfo.name}}</a>
                </div>
                <div style="text-align: left;font-size: 0.8em;font-weight: 100;color: grey"><kbd>@{{::userInfo.slug}}</kbd></div>
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
          </li>
        </ol>
      </div>
    </div>
  </div>
</div>
