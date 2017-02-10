<div class="flex-column ask-form">

  <div>
    <h1>Создать новую тему</h1>
    <form ng-submit="ask()" name="addNewTopicForm">
    <p>Задать новый вопрос</p>
    <div class="flex-row">
      <label for="questionCategory">Категория</label>
      <select id="questionCategory" name="questionCategory" required
              ng-options="item as item.name for item in categories track by item._id" ng-model="question.category" placeholder="Категория">

      </select>
      <i class="fa fa-fw fa-times" ng-show="addNewTopicForm.questionCategory.$invalid"></i>
      <i class="fa fa-fw fa-check" ng-show="addNewTopicForm.questionCategory.$valid"></i>
    </div>
    <div class="flex-row">
      <label for="questionTitle">Заголовок</label><input id="questionTitle" name="title" type="text" data-ng-model="question.title" placeholder="Заголовок вопроса" required autofocus>
      <i class="fa fa-fw fa-times" ng-show="addNewTopicForm.title.$invalid"></i>
      <i class="fa fa-fw fa-check" ng-show="addNewTopicForm.title.$valid"></i>
    </div>
    <div class="flex-row">
      <label for="questionDetails">Подробности</label>
      <textarea id="questionDetails" name="body" cols="30" rows="10" placeholder="Подробности" data-ng-model="question.body" required></textarea>
      <i class="fa fa-fw fa-times" ng-show="addNewTopicForm.body.$invalid"></i>
      <i class="fa fa-fw fa-check" ng-show="addNewTopicForm.body.$valid"></i>
    </div>
    <div class="flex-row">
      <label>&nbsp;</label>
      <div class="small">Поддерживаются теги:
        <kbd>b</kbd>,
        <kbd>i</kbd>,
        <kbd>a</kbd>,
        <kbd>img</kbd>,
        <kbd>code</kbd>,
        <kbd>pre</kbd>. <a href="#" id="pickFile">Приложить файл</a>
      </div>
    </div>
    <div class="flex-row" ng-show="experimental">
      <label></label>
      <input id="questionPrivate" type="checkbox" data-ng-model="question.private">
      <label for="questionPrivate">секретная тема</label>
    </div>
    <div class="flex-row " ng-show="question.private">
      <label for="questionAcl1"></label>
      <div  class="flex-row private">


      <label for="questionAcl">Доступ будет дан:</label>

      <div class="flex-column">
        <div class="flex-row" ng-repeat="friend in question.acl track by friend._id">

          <img ng-src="{{friend.picture}}" alt="" height="25" width="25">

          {{friend.name}} <i class="fa fa-times" ng-click="removeFromAcl(friend)"></i>

        </div>
        <div ng-show="question.acl.length === 0">Добавьте людей через email</div>
      </div>

      <div class="flex-column" >
        <input id="questionAcl" name="lookupEmail" type="email" data-ng-model="lookupEmail" placeholder="E-mail адреса для приватного доступа">
        <a class="button" data-ng-click="lookupAndAddToAcl()" ng-disabled="!sendButtonActive || addNewTopicForm.lookupEmail.$invalid">Добавить</a>
      </div>
      </div>
    </div>
    <div class="flex-row">
      <label>&nbsp;</label>
      <button ng-disabled="!sendButtonActive || addNewTopicForm.$invalid">Создать тему</button>
    </div>
    </form>
  </div>

</div>
