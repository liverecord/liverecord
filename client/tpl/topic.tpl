<div class="topic-view" ng-class="{advancedcompose: advancedCompose}">
  <div class="topic" id="topic">
    <div class="details">


      <div style="display: flex;align-items: center">

        <div style="flex-grow: 1;"><h1>{{::topic.title}}</h1></div>
        <div>
          <bookmark topic="topic"></bookmark>
        </div>
      </div>

      <div class="topic-body" ng-bind-html="::topic.body">
      </div>

      <div class="flex-row topic-authoring">
        <div class="col author">
          <a href="/users/{{::topic.user.slug}}"><img ng-src="{{::topic.user.picture}}" class="img-responsive"></a>
        </div>
        <div class="col" style="flex-grow: 1">
          <a href="/users/{{::topic.user.slug}}">{{::topic.user.name}}</a>  <span class="online" ng-show="topic.user.online" title="Онлайн"><i class="fa fa-circle"></i></span>
        </div>
        <div class="col">
          <span class="date" title="{{::topic.created | date: 'medium'}}">{{::topic.created | date:'short'}}</span>
        </div>
        <div class="col">
          <a href="#" ng-show="experimental" target="_blank"><i class="fa fa-share"></i></a>
        </div>
      </div>
    </div>

    <div class="comments">


      <div class="comments-list" ng-init="firstUser=''" id="commentsList">
        <div class="comment flex-row"
             ng-repeat="comment in (preparedComments = (comments | unique:'_id' | orderBy:'updated'))  track by comment._id"
             ng-class="{me: comment.user._id === user._id, lp: preparedComments[$index-1].user._id == comment.user._id, up: preparedComments[$index-1].user._id != comment.user._id }">
          <div class="avatar">
            <a ng-href="/users/{{::comment.user.slug}}"><img ng-src="{{::comment.user.picture}}" class="img-responsive"
                 ng-hide="{{preparedComments[$index-1].user._id == comment.user._id}}"></a>
          </div>
          <div class="flex-column comment-details">
            <div class="author" ng-hide="{{::(preparedComments[$index-1].user._id == comment.user._id)}}">
              <a ng-href="/users/{{::comment.user.slug}}">{{comment.user.name}}</a> <span class="online" ng-show="comment.user.online" title="Онлайн"><i class="fa fa-circle"></i></span>
            </div>
            <div class="text" ng-bind-html="::comment.body"></div>
          </div>
          <div class="date">
            <a class="time" name="comment_{{::comment._id}}" href="#comment_{{::comment._id}}" target="_self"
                  title="{{::comment.created | date: 'medium'}}">{{::comment.created | date:'shortTime'}}</a>
          </div>
        </div>
      </div>

      <div class="flex-center flex-row">
        <div class="typists">
          <div class="list" ng-show="typists.numberOfKeys()">
            <div class="starter"><i class="fa fa-pencil"></i></div>
            <div class="typist" ng-repeat="typist in typists track by typist._id"><img ng-src="{{::typist.picture}}" alt="{{::typist.name}}"
                                                                   title="{{::typist.name}}" class="img-responsive"></div>
          </div>
        </div>
      </div>
      <div class="join flex-center" ng-hide="user">
        <div class="welcoming">Интересуетесь темой? Есть, что добавить?</div>
        <div class="flex-row flex-center">
          <users-login-form></users-login-form>
        </div>
      </div>

    </div>
  </div>

  <div class="compose flex-row" ng-class="{sending: sending}" ng-show="user">
    <div class="controls">
      <button ng-click="switchAdvancedCompose()" ng-disabled="sending">
        <i class="fa " ng-class="advancedCompose ? 'fa-minus' : 'fa-plus'"></i>
      </button>
    </div>
    <div class="text">
      <textarea
              name="comment" id="comment" class="mono"
              ng-model="commentText" ng-disabled="sending" ng-keydown="commentKeyDown($event)"
              cols="20" rows="1" autofocus
              placeholder="Новое сообщение"></textarea>
      <div class="toolbar small" ng-show="advancedCompose">
        <small><input type="file" id="siofu_input" /> {{uploadStatus}}   Поддерживаются теги:
          <kbd>b</kbd>,
          <kbd>i</kbd>,
          <kbd>a</kbd>,
          <kbd>img</kbd>,
          <kbd>code</kbd>,
          <kbd>pre</kbd></small>
      </div>
    </div>
    <div class="send">
      <button ng-click="sendComment()" ng-disabled="!sendButtonActive"
              title="Нажмите {{$localStorage.sendCommentsCtrl}} для отправки">
        <i class="fa fa-paper-plane"></i>
      </button>
    </div>
  </div>

</div>



