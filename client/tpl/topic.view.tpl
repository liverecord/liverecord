<div class="topic-view" ng-class="{advancedcompose: advancedCompose, private: topic.private}">
  <div class="topic" id="topic">
    <div class="details">


      <div style="display: flex;align-items: center" itemscope itemtype="http://schema.org/Question">

        <div style="flex-grow: 1;"><h1 itemprop="name">{{topic.title}}</h1></div>

        <div>
          <bookmark topic="topic"></bookmark>
        </div>
      </div>

      <div class="topic-body" ng-bind-html="topic.body" itemprop="text">
      </div>

      <div class="flex-row topic-authoring">
        <div class="col author" itemprop="author" itemscope itemtype="http://schema.org/Person">
          <a href="/users/{{::topic.user.slug}}"><img ng-src="{{::topic.user.picture}}" class="img-responsive"></a>
        </div>
        <div class="col" style="flex-grow: 1">
          <a href="/users/{{::topic.user.slug}}">{{::topic.user.name}}</a>  <span class="online" ng-show="topic.user.online" title="Онлайн"><i class="fa fa-circle"></i></span>
        </div>
        <div class="col private" ng-show="topic.private">
          <div class="padlock"><i class="fa fa-fw fa-lock" title="Доступ к теме ограничен для пользователей"></i></div>
          <a href="/users/{{::aclu.slug}}" ng-repeat="aclu in topic.acl track by aclu._id"  title="{{::aclu.name}}">
            <img ng-src="{{::aclu.picture}}" class="img-responsive" alt="{{::aclu.name}}">
            </a>
        </div>
        <div class="col">
          <span class="date" ng-show="topic.created == topic.updated" title="{{::topic.created | date: 'medium'}}">{{::topic.created | date:'short'}}</span>
          <span class="date" ng-hide="topic.created == topic.updated" title="Создан {{::topic.created | date: 'medium'}}, обновлен {{::topic.updated | date: 'medium'}}">
            <i class="fa fa-pencil"></i>
            {{::topic.updated | date:'short'}}
          </span>
        </div>
        <div class="col" ng-show="topic.user._id == user._id">
          <a href="/edit/{{::topic.slug}}"><i class="fa fa-edit"></i></a>
        </div>
        <div class="col">
          <a href="#" ng-show="experimental" target="_blank"><i class="fa fa-share"></i></a>
        </div>
      </div>
    </div>

    <div class="comments">

      <div class="pagination">
        <a class="show-old-comments" ng-click="loadOlderComments()" ng-show="pagination.page < pagination.pages">Показать более ранние комментарии ({{pagination.total - pagination.page * pagination.limit}})</a>
      </div>
      <div class="comments-list" ng-init="firstUser=''" id="commentsList">
        <div class="comment flex-row"
             ng-repeat="comment in (preparedComments = (comments | unique:'_id' | orderBy:'updated'))  track by comment._id"
             ng-class="{me: comment.user._id === user._id, lp: preparedComments[$index-1].user._id == comment.user._id, up: preparedComments[$index-1].user._id != comment.user._id, spam: comment.spam, moderated: comment.moderated }">
          <div class="avatar">
            <div ng-hide="{{preparedComments[$index-1].user._id == comment.user._id}}">
              <a ng-href="/users/{{::comment.user.slug}}"><img ng-src="{{::comment.user.picture}}" class="img-responsive"
                ></a>
              <div class="rank">
                <i class="fa fa-fw fa-stop" ng-class="{ranked: comment.user.rank > 0}"></i>
                <i class="fa fa-fw fa-stop" ng-class="{ranked: comment.user.rank > 1}"></i>
                <i class="fa fa-fw fa-stop" ng-class="{ranked: comment.user.rank > 2}"></i>
                <i class="fa fa-fw fa-stop" ng-class="{ranked: comment.user.rank > 3}"></i>
                <i class="fa fa-fw fa-stop" ng-class="{ranked: comment.user.rank > 4}"></i>
              </div>
            </div>

          </div>
          <div class="flex-column comment-details">
            <div class="author" ng-hide="{{::(preparedComments[$index-1].user._id == comment.user._id)}}">
              <a ng-href="/users/{{::comment.user.slug}}">{{::comment.user.name}}</a> <span class="online" ng-show="::comment.user.online" title="Онлайн"><i class="fa fa-circle"></i></span>
            </div>
            <div class="text" ng-bind-html="::comment.body"></div>
            <div class="text-feedback">
              <a ng-click="vote(comment, 'up')"><i class="fa fa-fw fa-caret-up"></i></a>
              <span>{{comment.rating}}</span>
              <a ng-click="vote(comment, 'down')"><i class="fa fa-fw fa-caret-down"></i></a>
              <a ng-click="report(comment)"><i class="fa fa-fw fa-flag"></i></a>
            </div>
            <div ng-hide="comment.moderated" class="text-moderation" ng-show="::user.roles.indexOf('moderator') > -1">

              <a ng-click="moderateComment(comment, btn.label)" ng-repeat="btn in comment.classification track by btn._id" class="moderator button {{::btn.label}} " title="{{::btn.value}}">{{::btn.label}}</a>

            </div>
          </div>
          <div class="date">
            <a class="time hidden-xs" name="comment_{{::comment._id}}" href="#comment_{{::comment._id}}" target="_self"
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
      <div id="topicAnchor"><span></span></div>
    </div>
  </div>

  <div class="compose flex-row" ng-class="{sending: sending}" ng-show="user">
    <div class="controls">
      <button ng-click="switchAdvancedCompose()" ng-disabled="sending">
        <i class="fa " ng-class="advancedCompose ? 'fa-minus' : 'fa-plus'"></i>
      </button>
    </div>
    <div class="text">
      <div class="progress">
        <div class="bar" ng-style="{width: uploadProgress+'%'}" ></div>
      </div>
      <div class="toolbar" ng-show="advancedCompose">
        <a href="" ng-click="editor('b')" class="button"><i class="fa fa-fw fa-bold"></i></a>
        <a href="" ng-click="editor('i')"  class="button"><i class="fa fa-fw fa-italic"></i></a>
        <a href="" ng-click="editor('link')" class="button"><i class="fa fa-fw fa-link"></i></a>
        <a href="" ng-click="editor('picture')" class="button"><i class="fa fa-fw fa-picture-o"></i></a>
        <a href="" ng-click="editor('list-ul')" class="button"><i class="fa fa-fw fa-list-ul"></i></a>
        <a href="" ng-click="editor('list-ol')" class="button"><i class="fa fa-fw fa-list-ol"></i></a>
        <a href="" ng-click="editor('code')" class="button"><i class="fa fa-fw fa-code"></i></a>
        <a href="" ng-click="editor('keyboard')" class="button"><i class="fa fa-fw fa-keyboard-o"></i></a>
        <a href="" ng-click="editor('blockquote')" class="button"><i class="fa fa-fw fa-quote-left"></i></a>
        <a href="" ng-click="editor('sub')" class="button"><i class="fa fa-fw fa-subscript"></i></a>
        <a href="" ng-click="editor('sup')" class="button"><i class="fa fa-fw fa-superscript"></i></a>
        <a id="uploadEditorButton" class="button"><i class="fa fa-fw fa-paperclip"></i></a>
      </div>
      <textarea
              name="comment" id="comment" class="mono"
              ng-model="commentText" ng-disabled="sending" ng-keydown="commentKeyDown($event)"
              cols="20" rows="1" autofocus
              placeholder="Новое сообщение"></textarea>
      <div class="b-toolbar small" ng-show="advancedCompose">
        <small><input type="file" id="siofu_input" /> {{uploadStatus}}
          Поддерживаются теги:
          <kbd>b</kbd>, <kbd>i</kbd>, <kbd>a</kbd>, <kbd>img</kbd>, <kbd>code</kbd>, <kbd>pre</kbd>.</small>
      </div>
    </div>
    <div class="send">
      <button ng-click="sendComment()" ng-disabled="!sendButtonActive"
              title="Нажмите {{$localStorage.sendCommentsCtrl}} для отправки" ng-class="{sending: sending}">
        <i class="fa fa-paper-plane"></i>
      </button>
    </div>
  </div>

</div>



