<div class="flex-column">

  <div class="wrapper" id="wrapper" style="position: relative">
    <h1>Настройки</h1>

    <div>
      <h2>Глобальные</h2>

      <div class="signinform">
        <h3>Профиль</h3>
        <div class="message" ng-show="message">{{message}}</div>
        <form>
          <div><label for="profileName">Имя</label><input type="text" id="profileName" ng-model="profile.name" required
                                                          placeholder="Имя" ng-disabled="sending"></div>
          <div><label for="email">Почта</label><input type="email" id="email" ng-model="profile.email" required
                                                      placeholder="email" ng-disabled="sending"></div>
          <div><label for="sendEmailNotifications">Отправлять уведомления на почту</label><input type="checkbox" id="sendEmailNotifications" ng-model="profile.settings.notifications.email"  ng-disabled="sending"></div>
          <div><label for="profileAvatar">Аватар</label>
            <img ng-src="{{profile.picture}}" alt="-" class="responsive" width="100">
            <input type="file" id="profileAvatar" placeholder="Аватар" ng-disabled="sending"></div>
          <div><label></label><input type="submit" ng-click="update()" value="Сохранить" ng-disabled="sending"></div>
        </form>
      </div>

    </div>


    <div>
      <h2>Для текущего устройства</h2>
      <p><small>Стираются при выходе.</small></p>
      <div>
        <h3>Поведение</h3>
        <div>
          Отправка комментариев через
          <br>
          <input type="radio" value="Ctrl+Enter" name="sendComments" id="sendCommentsCtrlEnter"
                 ng-model="$localStorage.sendCommentsCtrl">
          <label
                  for="sendCommentsCtrlEnter">Ctrl + Enter</label>
          <br>
          <input type="radio" value="Enter" name="sendComments" id="sendCommentsEnter" ng-model="$localStorage.sendCommentsCtrl">
          <label for="sendCommentsEnter">Enter
            <small>(Используйте Shift+Enter для добавления новой строки)</small>
          </label>
        </div>
        <hr size="1">
        <div>
          <label for="experimentalFunctions">Экспериментальные функции</label>
          <input type="checkbox" ng-model="$localStorage.experimental" name="remember" id="experimentalFunctions"
                 ng-disabled="sending"><br>
          <small><b>Не рекомендуется неопытным пользователям!</b>
            Это опция включает поддержку нестандартных и недокументированных возможностей, часть из которых может влиять
            на работу с сайтом.
          </small>
        </div>

      </div>
    </div>


    <p>В разработке</p>


  </div>

</div>
