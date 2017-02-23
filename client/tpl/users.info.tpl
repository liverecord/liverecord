<div class="flex-column " style="width: 100%;">
  <div id="topic" style="position: relative">
    <div class="user-info flex-center">
      <h1><span class="online" ng-show="userInfo.online" title="Онлайн"><i class="fa fa-circle"></i></span> {{::userInfo.name}}</h1>
      <div><img ng-src="{{::userInfo.picture}}" alt="{{::userInfo.slug}}" class="img-responsive"></div>
      <div><small>@{{::userInfo.slug}}</small></div>
      <div>

        <div >
          Рейтинг:
          <span class="rank">
          <i class="fa fa-fw fa-stop" ng-class="{ranked: userInfo.rank > 0}"></i>&nbsp;
          <i class="fa fa-fw fa-stop" ng-class="{ranked: userInfo.rank > 1}"></i>&nbsp;
          <i class="fa fa-fw fa-stop" ng-class="{ranked: userInfo.rank > 2}"></i>&nbsp;
          <i class="fa fa-fw fa-stop" ng-class="{ranked: userInfo.rank > 3}"></i>&nbsp;
          <i class="fa fa-fw fa-stop" ng-class="{ranked: userInfo.rank > 4}"></i></span>
        </div>
      </div>
      <div><p>{{::userInfo.about}}</p></div>
      <div ng-show="userInfo.totals.topics > 0"><p>Всего тем: {{::userInfo.totals.topics}}</p></div>
      <div ng-show="userInfo.totals.comments > 0"><p>Всего комментариев: {{::userInfo.totals.comments}}</p></div>

      <div ng-show="userInfo._id === user._id">
        <a class="button" ng-href="/settings">Настройки</a>
      </div>
    </div>
    <div class="user-topics" ng-show="userInfo.details.topicList.length > 0">
    <h3>Темы пользователя</h3>
      <div ng-repeat="topic in userInfo.details.topicList track by topic._id" class="topic">
        <p><a ng-href="/{{::topic.category.slug}}/{{::topic.slug}}">{{::topic.title}}</a></p>
      </div>
    </div>
  </div>
</div>
