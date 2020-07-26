<div class="flex-column">

  <div class="wrapper settings" id="wrapper" style="position: relative">
    <h1>{{'Settings' | translate}}</h1>

    <div>
      <h2>{{'Global' | translate}}</h2>
      <div class="signinform flex-center">
        <h3>{{'Profile' | translate}}</h3>
        <div class="message" ng-show="message">{{message}}</div>
        <form name="userForm" ng-submit="update()" novalidate ng-cloak="">
          <div>
            <label for="profileName">{{'Name' | translate}}</label>
            <input type="text" placeholder="{{'Name' | translate}}" name="profileName"
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
          <div>
            <label for="nickName">{{'Alias' | translate}}</label>
            <input name="slug" type="text" id="nickName" ng-model="profile.slug" required
                                                             pattern="[a-zA-Z0-9-]+"
                                                             ng-minlength="3" ng-maxlength="64"
                                                             placeholder="{{'Alias' | translate}}" ng-disabled="sending">
            <i class="fa fa-fw fa-times" ng-show="userForm.slug.$invalid"></i>
            <i class="fa fa-fw fa-check" ng-show="userForm.slug.$valid"></i>

            <p ng-show="userForm.slug.$invalid && !userForm.slug.$pristine" class="help-block">
              {{'Alias advice' | translate}}
            </p>
          </div>
          <div>
            <label for="email">{{'Email'|translate}}</label>
            <input name="email" type="email" id="email" ng-model="profile.email" required
                                                      ng-minlength="3" ng-maxlength="64"
                                                      placeholder="email" ng-disabled="sending">
            <i class="fa fa-fw fa-times" ng-show="userForm.email.$invalid"></i>
            <i class="fa fa-fw fa-check" ng-show="userForm.email.$valid"></i>

            <p ng-show="userForm.email.$invalid && !userForm.email.$pristine" class="help-block">
              {{'Email advice' | translate}}
            </p>

          </div>
          <div><label for="profileAbout">{{'About'|translate}}</label><textarea placeholder="{{'About'|translate}}" name="profileAbout"
                                                          id="profileAbout" ng-model="profile.about"
                                                          ng-disabled="sending"></textarea>
          </div>
          <div class="flex-row">
            <label for="gender" title="{{'Gender required for correct localization'|translate}}">{{'Gender'|translate}}</label>

            <div>
              <div>
                <input type="radio" name="gender" id="gendermale" ng-model="profile.gender" value="male" ng-disabled="sending">
                <label for="gendermale">{{'Male'|translate}}</label>
              </div>
              <div>
                <input type="radio" name="gender" id="genderfemale" ng-model="profile.gender" value="female" ng-disabled="sending">
                <label for="genderfemale">{{'Female'|translate}}</label>
              </div>
              <div>
                <input type="radio" name="gender" id="genderOther" ng-model="profile.gender" value="" ng-disabled="sending">
                <label for="genderOther">{{'Other'|translate}}<span title="{{'Interface maybe weird'|translate}}">*</span></label>
              </div>
            </div>


          </div>
          <div>
            <label for="sendEmailNotifications">{{'Email notification'|translate}}</label>
            <input type="checkbox" id="sendEmailNotifications" ng-model="profile.settings.notifications.email" ng-disabled="sending">
          </div>
          <div>
            <label for="profileAvatar">{{'Avatar'|translate}}</label>
            <img ng-src="{{profile.picture}}" alt="-" class="responsive" width="100">
            <input type="file" id="profileAvatar" placeholder="{{'Avatar'|translate}}" ng-disabled="sending">
          </div>
          <div>
            <label></label>
            <input type="submit" ng-click="update()" value="{{'Save'|translate}}" ng-disabled="sending">
          </div>
        </form>
      </div>

    </div>

    <div>
      <h2>{{'Device specific settings'|translate}}</h2>
      <p><small>{{'Erased after exit'|translate}}</small></p>
      <div>
        <h3>{{'Behavior'|translate}}</h3>
        <div>
          {{'Send comments using'|translate}}
          <div>
            <input type="radio" value="Ctrl+Enter" name="sendComments" id="sendCommentsCtrlEnter"
                 ng-model="$localStorage.sendCommentsCtrl">
            <label
                  for="sendCommentsCtrlEnter">Ctrl + Enter</label>
          </div>
          <div>
            <input type="radio" value="Enter" name="sendComments" id="sendCommentsEnter" ng-model="$localStorage.sendCommentsCtrl">
            <label for="sendCommentsEnter">Enter
              <small>({{'Use Shift+Enter to add new line'|translate}})</small>
            </label>
          </div>
        </div>
        <div>
          <label for="audioNotice">{{'Sounds'|translate}}</label>
          <input type="checkbox"
                 ng-model="$localStorage.notifications.newComment.audio"
                 name="audioNotice" id="audioNotice">
          <label for="audioNoticeVolume">{{'Volume'|translate}}</label>
          <input type="range" step="any" min="0" max="1"
                 name="audioNoticeVolume" id="audioNoticeVolume"
                 ng-model="$localStorage.notifications.newComment.volume">

          <br>
        </div>

        <div>
          <label for="appTheme">{{'Theme'|translate}}</label>
          <select name="appTheme" id="appTheme" ng-options="option.name for option in data.themes track by option.id"
                  ng-model="$localStorage.applicationTheme" ng-change="updateTheme()">
          </select>
        </div>

        <hr size="1">
        <div>
          <label for="experimentalFunctions">{{'Experimental'|translate}}</label>
          <input type="checkbox" ng-model="$localStorage.experimental" name="remember" id="experimentalFunctions" ng-change="updateExperimental()"
                 ng-disabled="sending"><br>
          <small><b>{{'Experimental not for dummies'|translate}}!</b>
            {{'Experimental is not safe'|translate}}
          </small>
        </div>
        <div ng-show="experimental">
          <h2>{{'Notifications'|translate}}</h2>


          <table width="100%">
            <thead>
            <tr><th>{{'Push'|translate}}</th><th>{{'Browser'|translate}}</th><th>{{'Ip'|translate}}</th></tr>
            </thead>
            <tr ng-repeat="dev in user.devices">
              <td><input type="checkbox" ng-model="dev.pushEnabled" ng-change="updateDevice(dev)"></td>
              <td>{{dev.ua}}</td>
              <td>{{dev.lastIp}}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>


    <p ng-show="user.roles.has('admin')">***</p>


  </div>

</div>
