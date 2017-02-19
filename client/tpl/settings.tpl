<div class="flex-column">

  <div class="wrapper settings" id="wrapper" style="position: relative">
    <h1>Настройки</h1>

    <div>
      <h2>Глобальные</h2>
      <div class="signinform">
        <h3>Профиль</h3>
        <div class="message" ng-show="message">{{message}}</div>
        <form name="userForm" ng-submit="update()" novalidate ng-cloak="">
          <div><label for="profileName">Имя</label><input type="text" placeholder="Имя" name="profileName"
                                                          id="profileName" ng-model="profile.name"
                                                          required ng-minlength="2" ng-maxlength="32"
                                                           ng-disabled="sending">
            <i class="fa fa-fw fa-times" ng-show="userForm.profileName.$invalid"></i>
            <i class="fa fa-fw fa-check" ng-show="userForm.profileName.$valid"></i>


            <div ng-messages="userForm.profileName.$error" role="alert">
              <div ng-message="required" class="help-block">Введите имя, которое будет отображаться.</div>
              <div ng-message="minlength" class="help-block">Ваше имя слишком короткое.</div>
              <div ng-message="maxlength" class="help-block">Ваше имя слишком длинное.</div>
            </div>

          </div>
          <div><label for="nickName">Псевдоним</label><input name="slug" type="text" id="nickName" ng-model="profile.slug" required
                                                             pattern="[a-zA-Z0-9-]+"
                                                             ng-minlength="3" ng-maxlength="64"
                                                             placeholder="Псевдоним" ng-disabled="sending">
            <i class="fa fa-fw fa-times" ng-show="userForm.slug.$invalid"></i>
            <i class="fa fa-fw fa-check" ng-show="userForm.slug.$valid"></i>

            <p ng-show="userForm.slug.$invalid && !userForm.slug.$pristine" class="help-block">
              Введите свой <kbd>@</kbd>псевдоним. Только латинские буквы, цифры и дефис от 3х до 16 символов.
            </p>
          </div>
          <div><label for="email">Почта</label><input name="email" type="email" id="email" ng-model="profile.email" required
                                                      ng-minlength="3" ng-maxlength="64"
                                                      placeholder="email" ng-disabled="sending">
            <i class="fa fa-fw fa-times" ng-show="userForm.email.$invalid"></i>
            <i class="fa fa-fw fa-check" ng-show="userForm.email.$valid"></i>

            <p ng-show="userForm.email.$invalid && !userForm.email.$pristine" class="help-block">Этот email неверен, попробуйте ввести другой.</p>

          </div>
          <div><label for="profileAbout">О себе</label><textarea placeholder="О себе" name="profileAbout"
                                                          id="profileAbout" ng-model="profile.about"
                                                          ng-disabled="sending"></textarea>
          </div>
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
          <div>
            <input type="radio" value="Ctrl+Enter" name="sendComments" id="sendCommentsCtrlEnter"
                 ng-model="$localStorage.sendCommentsCtrl">
            <label
                  for="sendCommentsCtrlEnter">Ctrl + Enter</label>
          </div>
          <div>
            <input type="radio" value="Enter" name="sendComments" id="sendCommentsEnter" ng-model="$localStorage.sendCommentsCtrl">
            <label for="sendCommentsEnter">Enter
              <small>(Используйте Shift+Enter для добавления новой строки)</small>
            </label>
          </div>
        </div>
        <div>
          <label for="audioNotice">Звуковые уведомления</label>
          <input type="checkbox" ng-model="$localStorage.notifications.newComment.audio" name="audioNotice" id="audioNotice"
                 ><br>
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
        <div ng-show="experimental">
          <h2>Уведомления</h2>
          <table width="100%">
            <thead>
            <tr><th>Push</th><th>Браузер</th><th>Ip</th></tr>
            </thead>
            <tr ng-repeat="dev in user.devices">
              <td><input type="checkbox" ng-model="dev.pushEnabled"></td>
              <td>{{dev.ua}}</td>
              <td>{{dev.lastIp}}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>


    <p>В разработке</p>


  </div>

</div>
