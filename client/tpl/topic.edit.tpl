<div class="flex-column ask-form">

  <div ng-cloak="">
    <h1><span ng-hide="editing">Создать новую тему</span> <span ng-show="editing">Редактировать <q>{{::topic.title}}</q></span></h1>
    <form ng-submit="ask()" name="addNewTopicForm">
    <div class="flex-row">
      <label class="label" for="questionCategory">Категория</label>
      <select id="questionCategory" name="questionCategory" required
              ng-options="item as item.name for item in categories track by item._id" ng-model="topic.category" placeholder="Категория">
      </select>
      <i class="fa fa-fw fa-times" ng-show="addNewTopicForm.questionCategory.$invalid"></i>
      <i class="fa fa-fw fa-check" ng-show="addNewTopicForm.questionCategory.$valid"></i>
    </div>
    <div class="flex-row">
      <label class="label" for="questionTitle">Заголовок</label>
      <input id="questionTitle" name="title" type="text" data-ng-model="topic.title" placeholder="Заголовок вопроса" required>
      <i class="fa fa-fw fa-times" ng-show="addNewTopicForm.title.$invalid"></i>
      <i class="fa fa-fw fa-check" ng-show="addNewTopicForm.title.$valid"></i>
    </div>
    <div class="flex-row">
      <label class="label" for="questionDetails">Подробности</label>
      <textarea id="questionDetails" name="body" cols="30" rows="10" placeholder="Подробности" data-ng-model="topic.body" required></textarea>
      <i class="fa fa-fw fa-times" ng-show="addNewTopicForm.body.$invalid"></i>
      <i class="fa fa-fw fa-check" ng-show="addNewTopicForm.body.$valid"></i>
    </div>
    <div class="flex-row">
      <label class="label">&nbsp;</label>
      <div class="small">Поддерживаются теги:
        <kbd>b</kbd>,
        <kbd>i</kbd>,
        <kbd>a</kbd>,
        <kbd>img</kbd>,
        <kbd>code</kbd>,
        <kbd>pre</kbd>. <a href="#" id="pickFile">Приложить файл</a>
      </div>
    </div>
    <div class="flex-row">
      <label class="label"></label>
      <input id="questionPrivate" type="checkbox" data-ng-model="topic.private">
      <label for="questionPrivate">секретная тема</label>
    </div>
    <div class="flex-row " ng-show="topic.private">
      <label class="label" for="questionAcl1"></label>
      <div class="flex-row private">
        <label for="questionAcl">Доступ будет дан:</label>
        <div class="flex-column acl-list">
          <div class="flex-row item" ng-repeat="friend in topic.acl track by friend._id">
            <img ng-src="{{friend.picture}}" alt="" height="25" width="25">
            {{friend.name}} <i class="fa fa-times" ng-click="removeFromAcl(friend)"></i>
          </div>
          <div ng-show="topic.acl.length === 0"><i>Добавьте людей через email</i></div>
        </div>
        <div class="flex-column search" >
          <input id="lookupEmail" name="lookupEmail" type="email" data-ng-model="lookupEmail" placeholder="E-mail или @nickname" title="Введите email или nickname пользователя, чтобы дать ему доступ">
          <a class="button" data-ng-click="lookupAndAddToAcl()" ng-disabled="!sendButtonActive || addNewTopicForm.lookupEmail.$invalid">Добавить</a>
        </div>
      </div>
    </div>
    <div class="flex-row">
      <label class="label">&nbsp;</label>
      <button ng-disabled="!sendButtonActive || addNewTopicForm.$invalid"><span ng-hide="editing">Создать</span> <span ng-show="editing">Сохранить</span> тему</button>
    </div>
    </form>
  </div>
</div>
