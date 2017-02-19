<div class="signinform" ng-cloak="">
  <h3>Присоединяйтесь</h3>
  <p>Войдите или зарегистрируйтесь, используя эту форму</p>
  <div class="message" ng-show="message">{{message}}</div>
  <form>
    <div><label for="email">Почта</label><input type="email" id="email" ng-model="authData.email" required placeholder="email" ng-disabled="sending"></div>
    <div><label for="password">Пароль</label><input type="password" id="password" ng-model="authData.password" required placeholder="пароль" ng-disabled="sending"></div>
    <div>
      <label><a href="/users/password/restore" class="small" ng-disabled="sending">Напомнить</a></label>
      <label for="rememberMe">Мой ПК</label><input type="checkbox" ng-model="authData.rememberMe" name="remember" id="rememberMe"  ng-disabled="sending">
    </div>
    <div></div>
    <div><label></label><input type="submit" ng-click="auth()" value="Войти" ng-disabled="sending"></div>
  </form>

</div>
