<div class="flex-column ask-form">
  <div ng-cloak="" ng-click="docClick()">
    <h1>
      <span ng-hide="editing" ng-bind="'Create new topic'|translate"></span>
      <span ng-show="editing"><span ng-bind="'Edit topic'|translate"></span> <q ng-bind="topic.title"></q></span>
    </h1>
    <form ng-submit="ask()" name="addNewTopicForm">
      <div class="flex-row">
        <select id="questionCategory" name="questionCategory" required
                ng-options="item as item.name for item in categories track by item._id"
                ng-model="topic.category" placeholder="{{'Category'|translate}}">
          <option value="" disabled>--- {{'Please select'|translate}} ---</option>
        </select>
        <i class="fa fa-fw fa-times" ng-show="addNewTopicForm.questionCategory.$invalid"></i>
        <i class="fa fa-fw fa-check" ng-show="addNewTopicForm.questionCategory.$valid"></i>
      </div>
      <div class="flex-row">
        <input id="questionTitle" name="title" type="text" data-ng-model="topic.title" placeholder="{{'Topic title'|translate}}" required>
        <i class="fa fa-fw fa-times" ng-show="addNewTopicForm.title.$invalid"></i>
        <i class="fa fa-fw fa-check" ng-show="addNewTopicForm.title.$valid"></i>
      </div>
      <div class="flex-row">
        <div class="acl-list-box">
          <div class="flex-row item" ng-repeat="friend in topic.acl track by friend._id" ng-cloak="">
            <img ng-src="{{friend.picture}}" alt="">
            <span class="name" ng-bind="friend.name"></span>
            <span><i class="fa fa-fw fa-times" ng-click="removeFromAcl(friend)"></i></span>
          </div>
          <label for="lookupUserForAcl" class="flex-row tip" ng-show="topic.acl.length === 0"><i ng-bind="'Add people'|translate"></i></label>
          <div class="flex-row search-box">
            <input id="lookupUserForAcl" name="lookupEmail" type="text" data-ng-model="lookupEmail"
                   placeholder="{{'Email or @nickname'|translate}}" ng-focus="runSearch()"
                   autocomplete="off"
                   ng-paste="runSearch()" ng-change="runSearch()"
                   title="{{'Type email for lookup'|translate}}">
            <a class="button" data-ng-click="runSearch()" title="{{'Add'|translate}}"
               ng-disabled="!sendButtonActive || addNewTopicForm.lookupEmail.$invalid"><i class="fa fa-fw fa-search"></i></a>
            <div class="search-box-dropdown" ng-show="showSearchResults">
              <div class="search-box-scroll-wrapper">
                <div class="flex-row search-box-item" ng-repeat="item in searchResults track by item._id" ng-cloak=""
                     ng-click="addToAcl(item, $event)">
                  <img ng-src="{{item.picture}}" alt="{{item.slug}}">
                  <span class="name" ng-bind="item.name"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <i class="fa fa-fw fa-lock" ng-show="topic.private"></i>
        <i class="fa fa-fw fa-unlock" ng-show="!topic.private"></i>

      </div>
      <div class="flex-row">
        <lr-editor html="topic.body"></lr-editor>
      </div>
      <div class="flex-row">
        <button ng-disabled="!sendButtonActive || addNewTopicForm.$invalid"><span ng-hide="editing" ng-bind="'Create'|translate"></span>
          <span ng-show="editing" ng-bind="'Save'|translate"></span></button>
      </div>
    </form>
  </div>
</div>
