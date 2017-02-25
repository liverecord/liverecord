<div class="signinform">
  <h3>{{'Password restore' | translate}}</h3>
  <p>{{'Password restore instructions' | translate}}</p>
  <div class="message" ng-show="message">{{message}}</div>
  <form>
    <div><label for="email">{{'Email' | translate}}</label><input type="email" id="email" ng-model="authData.email" required placeholder="email" ng-disabled="sending"></div>
    <div></div>
    <div><label></label><input type="submit" ng-click="send()" value="{{'Send' | translate}}" ng-disabled="sending"></div>
  </form>

</div>
