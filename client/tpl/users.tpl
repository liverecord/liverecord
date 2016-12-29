<div class="flex-column " style="width: 100%;">
  <div id="topic" style="position: relative">
    <div class="user-info flex-center">
      <h1>{{userInfo.name}}</h1>
      <div><img ng-src="{{userInfo.picture}}" alt="" class="img-responsive"></div>
      <div><p>Всего тем: {{userInfo.details.topicCount}}</p></div>
      <div><p>Всего комментариев: {{userInfo.details.commentCount}}</p></div>
      <div ng-show="userInfo._id === user._id">
        <a class="button" href="/settings">Настройки</a>
      </div>
    </div>
    <div class="user-topics">
    <h3>Темы пользователя</h3>
      <div ng-repeat="topic in userInfo.details.topicList" class="topic">
        <p><a ng-href="/{{topic.category.slug}}/{{topic.slug}}">{{topic.title}}</a></p>
      </div>
    </div>
  </div>
</div>
