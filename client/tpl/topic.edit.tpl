<div class="flex-column ask-form">

  <div ng-cloak="">
    <h1>
      <span ng-hide="editing">{{'Create new topic'|translate}}</span>
      <span ng-show="editing">{{'Edit topic'|translate}} <q>{{topic.title}}</q></span>
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
      <lr-editor html="topic.body"></lr-editor>
    </div>
      <div class="flex-row">

      <!textarea id="questionDetails" name="body" cols="30" rows="10" placeholder="{{'Details'|translate}}"
                data-ng-model="topic.body" required></textarea>
      <i class="fa fa-fw fa-times" ng-show="addNewTopicForm.body.$invalid"></i>
      <i class="fa fa-fw fa-check" ng-show="addNewTopicForm.body.$valid"></i>
    </div>


    <div class="flex-row">
      <label class="label">&nbsp;</label>
      <div class="small">{{'We support some HTML tags'|translate}}:
        <kbd>b</kbd>,
        <kbd>i</kbd>,
        <kbd>a</kbd>,
        <kbd>img</kbd>,
        <kbd>code</kbd>,
        <kbd>pre</kbd>. <a href="#" id="pickFile">{{'Attach a file'|translate}}</a>
      </div>
    </div>
    <div class="flex-row">
      <label class="label"></label>
      <input id="questionPrivate" type="checkbox" data-ng-model="topic.private">
      <label for="questionPrivate">{{'Secret topic'|translate}}</label>
    </div>
    <div class="flex-row " ng-show="topic.private">
      <label class="label" for="questionAcl1"></label>
      <div class="flex-row private">
        <label for="questionAcl">{{'Accessible by'|translate}}:</label>
        <div class="flex-column acl-list">
          <div class="flex-row item" ng-repeat="friend in topic.acl track by friend._id">
            <img ng-src="{{friend.picture}}" alt="" height="25" width="25">
            {{friend.name}} <i class="fa fa-times" ng-click="removeFromAcl(friend)"></i>
          </div>
          <div ng-show="topic.acl.length === 0"><i>{{'Add people'|translate}}</i></div>
        </div>
        <div class="flex-column search" >
          <input id="lookupEmail" name="lookupEmail" type="text" data-ng-model="lookupEmail"
                 placeholder="{{'Email or @nickname'|translate}}"
                 title="{{'Type email for lookup'|translate}}">
          <a class="button" data-ng-click="lookupAndAddToAcl()"
             ng-disabled="!sendButtonActive || addNewTopicForm.lookupEmail.$invalid">{{'Add'|translate}}</a>
        </div>
      </div>
    </div>
    <div class="flex-row">
      <label class="label">&nbsp;</label>
      <button ng-disabled="!sendButtonActive || addNewTopicForm.$invalid"><span ng-hide="editing">{{'Create'|translate}}</span>
        <span ng-show="editing">{{'Save'|translate}}</span></button>
    </div>
    </form>
  </div>
</div>
