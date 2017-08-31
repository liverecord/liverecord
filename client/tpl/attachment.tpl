<div class="attachment">
  <a ng-href="{{::attachment.link}}" target="_blank" ng-show="::(attachment.thumbnailUrl && !attachment.html)">
    <img ng-src="{{::attachment.thumbnailUrl}}" alt="{{::attachment.title}}">
  </a>
  <div class="" ng-bind-html="::attachment.html" ng-show="::attachment.html"></div>
  <div><a ng-href="{{::attachment.link}}" class="link" target="_blank" ng-bind="::attachment.title"></a></div>
</div>
