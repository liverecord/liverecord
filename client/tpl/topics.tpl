<div class="wrapper">


  <h1 ng-bind-html="activeCategory.name"></h1>
  <p ng-bind-html="activeCategory.description"></p>


  <div ng-if="user">
    <p>Выберите тему или <a ng-href="/ask?category={{category}}">создайте новую</a>.</p>
  </div>

  <div ng-if="!user">
    <users-login-form user="user"></users-login-form>
  </div>

</div>
