<div class="flex-column ask-form">

  <div>
    <h1>Создать новую тему</h1>
    <p>Задать новый вопрос</p>
    <div class="flex-row">
      <label for="questionCategory">Категория</label>
      <select id="questionCategory" name="cat" ng-options="item as item.name for item in categories track by item._id" ng-model="question.category" placeholder="Категория"></select>
    </div>
    <div class="flex-row">
      <label for="questionTitle">Заголовок</label>
      <input id="questionTitle" type="text" data-ng-model="question.title" placeholder="Заголовок вопроса" required autofocus>
    </div>
    <div  class="flex-row">
      <label for="questionDetails">Подробности</label>
      <textarea id="questionDetails" name="body" cols="30" rows="10" placeholder="Подробности" data-ng-model="question.body" required></textarea>
    </div>
    <div class="flex-row">
      <label>&nbsp;</label>
      <div class="small">Поддерживаются теги:
        <kbd>b</kbd>,
        <kbd>i</kbd>,
        <kbd>a</kbd>,
        <kbd>img</kbd>,
        <kbd>code</kbd>,
        <kbd>pre</kbd>
      </div>
    </div>
    <div class="flex-row">
      <label>&nbsp;</label>
      <button data-ng-click="ask()" ng-disabled="!sendButtonActive">Задать</button>
    </div>
  </div>

</div>
