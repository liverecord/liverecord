<div class="topic-view" >
  <div class="topic" id="topic">

    <nav>
      <a href="/admin/">Admin</a>
    </nav>
    
    <h1>CMS</h1>

    <div class="show-tree" ng-hide="showPageEditForm">
      <p>Pages</p>
      <button class="button" ng-click="editPage()">Add Page</button>
      <div ng-repeat="item in pages track by item._id">
        {{item.materializedPath}}
        <button ng-click="editPage(item.materializedPath)">
          <i class="fa fa-edit"></i>
        </button>
      </div>
    </div>

    <div class="edit-form" ng-show="showPageEditForm">
      <div class="flex-column ask-form">
        <div ng-cloak="" ng-click="docClick()">
          <h3>
            <span ng-hide="editing" ng-bind="'Create new page'|translate"></span>
            <span ng-show="editing"><span ng-bind="'Edit page'|translate"></span> <q ng-bind="page.title"></q></span>
          </h3>
          <form ng-submit="savePage()" name="addNewPageForm">
            <div class="flex-row">
              <input id="pageTitle" name="title" type="text" data-ng-model="page.title" placeholder="{{'Page title'|translate}}" required>
              <i class="fa fa-fw fa-times" ng-show="addNewPageForm.title.$invalid"></i>
              <i class="fa fa-fw fa-check" ng-show="addNewPageForm.title.$valid"></i>
            </div>
            <div class="flex-row">
              <input id="pageDescription" name="description" type="text" data-ng-model="page.description" placeholder="{{'Page description'|translate}}">
              <i class="fa fa-fw fa-times" ng-show="addNewPageForm.description.$invalid"></i>
              <i class="fa fa-fw fa-check" ng-show="addNewPageForm.description.$valid"></i>
            </div>
            <div class="flex-row">
              <input id="pageName" name="name" type="text" data-ng-model="page.name" placeholder="{{'Page name'|translate}}" required>
              <i class="fa fa-fw fa-times" ng-show="addNewPageForm.name.$invalid"></i>
              <i class="fa fa-fw fa-check" ng-show="addNewPageForm.name.$valid"></i>
            </div>
            <div class="flex-row">
              <input id="pageSlug" name="slug" type="text" data-ng-model="page.slug" placeholder="{{'Page slug'|translate}}" required>
              <i class="fa fa-fw fa-times" ng-show="addNewPageForm.slug.$invalid"></i>
              <i class="fa fa-fw fa-check" ng-show="addNewPageForm.slug.$valid"></i>
            </div>
            <div class="flex-row">
              <input id="pageMenu" name="menu" type="text" data-ng-model="page.menu" placeholder="{{'Page menu'|translate}}">
              <i class="fa fa-fw fa-times" ng-show="addNewPageForm.menu.$invalid"></i>
              <i class="fa fa-fw fa-check" ng-show="addNewPageForm.menu.$valid"></i>
            </div>

            <div class="flex-row">
              <lr-editor html="page.body"></lr-editor>
            </div>
            <div class="flex-row">
              <button ng-disabled="!sendButtonActive || addNewPageForm.$invalid"><span ng-hide="editing" ng-bind="'Create'|translate"></span>
                <span ng-show="editing" ng-bind="'Save'|translate"></span></button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</div>



