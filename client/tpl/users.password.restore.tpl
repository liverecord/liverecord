<div class="signinform">
  <h3>Восстановить пароль</h3>
  <p>Укажите свой адрес электронной почты, на него будет отправлены инструкции</p>
  <div class="message" ng-show="message">{{message}}</div>
  <form>
    <div><label for="email">Почта</label><input type="email" id="email" ng-model="authData.email" required placeholder="email" ng-disabled="sending"></div>
    <div></div>
    <div><label></label><input type="submit" ng-click="send()" value="Отправить" ng-disabled="sending"></div>
  </form>

</div>
