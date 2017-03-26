<div class="signinform" ng-cloak="">
  <h3>{{'Join'|translate}}</h3>
  <p>{{'Signin or signup'|translate}}</p>
  <div class="message" ng-show="message">{{message}}</div>
  <div class="sso">
    <a href="/api/oauth/facebook/" class="button" target="_top"><i class="fa fa-fw fa-facebook"></i></a>
    <a href="/api/oauth/twitter/" class="button" target="_top"><i class="fa fa-fw fa-twitter"></i></a>
  </div>
  <form>
    <div>
      <label for="email">{{'Email'|translate}}</label>
      <input type="email" id="email" ng-model="authData.email"
        required placeholder="{{'Email'|translate}}" ng-disabled="sending">
    </div>
    <div>
      <label for="password">{{'Password'|translate}}</label>
      <input type="password" id="password"
          ng-model="authData.password" required
          placeholder="{{'Password'|translate}}" ng-disabled="sending">
    </div>
    <div>
      <label>
        <a href="/users/password/restore" class="small" ng-disabled="sending">{{'Restore'|translate}}
          </a></label>
      <label for="rememberMe">{{'My Comp'|translate}}</label>
      <input type="checkbox" ng-model="authData.rememberMe"
         name="remember" id="rememberMe" ng-disabled="sending">
    </div>
    <div></div>
    <div>
      <label></label>
      <input type="submit" ng-click="auth()" value="{{'Join'|translate}}" ng-disabled="sending">
    </div>
  </form>

</div>
