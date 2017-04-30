<div class="flex-column " style="width: 100%;">
  <div id="topic" style="position: relative">
    <div itemscope itemtype="http://schema.org/Person" class="user-info flex-center">
      <h1>
        <span class="online" ng-show="userInfo.online" title="{{'Online' | translate}}"><i class="fa fa-circle"></i></span>
        <span itemprop="name">{{::userInfo.name}}</span>
      </h1>
      <div>
        <img ng-src="{{::userInfo.picture}}" itemprop="image" alt="{{::userInfo.slug}}" class="img-responsive">
      </div>
      <div><small itemprop="alternateName">@{{::userInfo.slug}}</small></div>
      <div>
        <div>
          <span ng-bind="'Rating' | translate"></span>:
          <lr-rank user="userInfo"></lr-rank>
        </div>
      </div>
      <div><p itemprop="description">{{::userInfo.about}}</p></div>
      <div ng-show="userInfo.totals.topics > 0"><p>{{'Total topics' | translate}}: {{::userInfo.totals.topics}}</p></div>
      <div ng-show="userInfo.totals.comments > 0"><p>{{'Total comments' | translate}}: {{::userInfo.totals.comments}}</p></div>
      <div ng-show="user">
        <a class="button" ng-href="/ask?user={{::userInfo.slug}}">{{'Ask privately' | translate}}</a>
      </div>
      <div ng-show="user && userInfo._id === user._id">
        <a class="button" ng-href="/settings">{{'Settings' | translate}}</a>
      </div>
    </div>
    <div class="user-topics" ng-show="userInfo.details.topicList.length > 0">
      <h3>{{'User\'s topics'| translate}}</h3>
      <div ng-repeat="topic in userInfo.details.topicList track by topic._id" class="topic">
        <p><a ng-href="/{{::topic.category.slug}}/{{::topic.slug}}">{{::topic.title}}</a></p>
      </div>
    </div>
  </div>
</div>
