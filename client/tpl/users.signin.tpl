<div class="flex-column " style="width: 100%;">
  <div id="topic" style="position: relative">
    <div ng-hide="user">
      <users-login-form></users-login-form>
    </div>
    <div ng-show="user">

      <h1><span ng-bind="user.name" class="button"></span></h1>
      <p><a ng-href="/ask?category={{category}}" class="button" ng-show="user"><i class="fa fa-pencil-square-o" aria-hidden="true"></i> <span class="hidden-xs">{{'New topic'|translate}}</span></a></p>

      <p><a ng-href="/users/{{user.slug}}" ng-bind="'Profile'|translate" class="button"></a></p>
      <p><a ng-href="/settings" ><i class="fa fa-cog" aria-hidden="true"></i> <span class="hidden-xs" ng-bind="'Settings'|translate"></span></a></p>

    </div>
  </div>
</div>


