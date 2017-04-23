<div class="bookmark-this-topic" ng-cloak="">
  <a href="" ng-show="$ctrl.show"
     ng-click="$ctrl.bookmarkIt()"
     tooltips
     tooltip-side="left"
     tooltip-template="{{'Bookmark It' | translate}}"
     title="{{'Bookmark It' | translate}}"><i class="fa fa-fw fa-2x" ng-class="{'fa-bookmark': $ctrl.bookmarked, 'fa-bookmark-o': !$ctrl.bookmarked }"></i></a>
</div>
