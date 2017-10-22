<div class="topic-view" >
  <div class="topic" id="topic">

    <nav>
      <a href="/admin/">Admin</a>
    </nav>
    

    <div class="show-tree" ng-hide="showCategoryEditForm">
      <h3>Categories</h3>
      <button class="button" ng-click="editCategory()">Add Category</button>
      <div ng-repeat="item in categories track by item._id">
        {{item.name}}
        <button ng-click="editCategory(item._id)">
          <i class="fa fa-edit"></i>
        </button>
      </div>
    </div>

    <div class="edit-form" ng-show="showCategoryEditForm">
      <div class="flex-column ask-form">
        <div ng-cloak="" ng-click="docClick()">
          <h3>
            <span ng-hide="editing" ng-bind="'Create new category'|translate"></span>
            <span ng-show="editing"><span ng-bind="'Edit category'|translate"></span> <q ng-bind="category.name"></q></span>
          </h3>
          <form ng-submit="saveCategory()" name="addNewCategoryForm">
            <div class="flex-row">
              <input id="categoryName" name="name" type="text"
                     data-ng-model="category.name" placeholder="{{'Category name'|translate}}" required>
              <i class="fa fa-fw fa-times" ng-show="addNewCategoryForm.name.$invalid"></i>
              <i class="fa fa-fw fa-check" ng-show="addNewCategoryForm.name.$valid"></i>
            </div>
            <div class="flex-row">
              <lr-editor html="category.description"></lr-editor>
            </div>
            <div class="flex-row">
              <button ng-disabled="!sendButtonActive || addNewCategoryForm.$invalid">
                <span ng-hide="editing" ng-bind="'Create'|translate"></span>
                <span ng-show="editing" ng-bind="'Save'|translate"></span>
              </button>
              <div style="flex-grow: 2">
              </div>
              <input id="categoryOrder" name="name" size="5"
                     step="1"
                     type="number" min="0" max="1000" data-ng-model="category.order" placeholder="#" required>

            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</div>



