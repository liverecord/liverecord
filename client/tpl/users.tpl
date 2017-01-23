<div class="flex-column " style="width: 100%;">
  <div id="topic" style="position: relative">
    <div class="user-info flex-center">
      <h1>{{::userInfo.name}}</h1>
      <div><small>@{{::userInfo.slug}}</small></div>
      <div><img ng-src="{{::userInfo.picture}}" alt="{{::userInfo.slug}}" class="img-responsive"></div>
      <div><p><span class="online" ng-show="userInfo.online" title="Онлайн"><i class="fa fa-circle"></i></span></p></div>
      <div><p>Всего тем: {{::userInfo.details.topicCount}}</p></div>
      <div><p>Всего комментариев: {{::userInfo.details.commentCount}}</p></div>
      <div ng-show="userInfo._id === user._id">
        <a class="button" ng-href="/settings">Настройки</a>
      </div>
    </div>
    <div class="user-topics">
    <h3>Темы пользователя</h3>
      <div ng-repeat="topic in userInfo.details.topicList track by topic._id" class="topic">
        <p><a ng-href="/{{::topic.category.slug}}/{{::topic.slug}}">{{::topic.title}}</a></p>
      </div>
    </div>
  </div>
</div>
