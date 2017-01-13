<div class="wrapper">


  <h1>{{activeCategory.name}}</h1>
  <p>{{activeCategory.description}}</p>


  <div ng-if="user">
    <p>Выберите тему или <a href="/ask">создайте новую</a>.</p>
  </div>

  <div ng-if="!user">
    <users-login-form user="user"></users-login-form>
  </div>

</div>
