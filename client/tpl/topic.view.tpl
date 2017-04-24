<div class="topic-view" ng-class="{advancedcompose: advancedCompose, private: topic.private}">
  <div class="topic" itemscope itemtype="http://schema.org/Question" id="topic">
    <div class="details">

      <div style="display: flex;align-items: center">
        <div style="flex-grow: 1;">
          <h1 itemprop="name" ng-bind="topic.title"></h1>
          <div class="date">
          <span class="date" ng-cloak="" ng-show="topic.created == topic.updated"
                title="{{::topic.created | date: 'medium'}}" ng-bind="::topic.created | date:'short'">
          </span>
            <span class="date" ng-cloak="" ng-hide="topic.created == topic.updated"
                  title="{{'Created'|translate}} {{::topic.created | date: 'medium'}}, {{'Updated'|translate}} {{::topic.updated | date: 'medium'}}">
                <i class="fa fa-pencil"></i>
                <span ng-bind="::topic.updated|date:'short'"></span>
            </span>
          </div>
          <div itemprop="text" class="topic-body" ng-bind-html="topic.body"></div>
        </div>
      </div>
      <div class="flex-row topic-authoring">
        <div class="col " itemprop="author" itemscope itemtype="http://schema.org/Person">
          <div class="flex-row">
            <div><a ng-href="/users/{{::topic.user.slug}}"><img ng-src="{{::topic.user.picture}}" class="img-responsive"></a></div>

          </div>
        </div>
        <div class="col author">
          <a itemprop="name" ng-href="/users/{{::topic.user.slug}}" ng-bind="::topic.user.name"></a>
          <span class="online" ng-show="topic.user.online" title="{{'Online'|translate}}"><i class="fa fa-circle"></i></span>
          <br><lr-rank user="topic.user" style="float: left"></lr-rank>
        </div>
        <div class="col" style="flex-grow: 1">

        </div>
        <div class="col private" ng-show="topic.private">
          <div class="padlock"><i class="fa fa-fw fa-lock" title="{{'Access limited to'|translate}}"></i></div>
          <a ng-href="/users/{{::aclu.slug}}" ng-repeat="aclu in topic.acl track by aclu._id"  title="{{::aclu.name}}">
            <img ng-src="{{::aclu.picture}}" class="img-responsive" alt="{{::aclu.name}}">
            </a>
        </div>
        <div class="col">
        </div>
        <div class="col">
          <lr-bookmark topic="topic" ng-cloak=""></lr-bookmark>
        </div>
        <div class="col">
          <lr-rtc ng-show="user" topic="topic" ng-cloak=""></lr-rtc>
        </div>
        <div class="col" ng-show="topic.user._id == user._id" ng-cloak="">
          <a ng-href="/edit/{{::topic.slug}}"><i class="fa fa-fw fa-2x fa-edit"></i></a>
        </div>
        <div class="col">
          <a href="#" ng-cloak="" socialshare socialshare-provider="facebook" socialshare-text="{{topic.title}}"><i class="fa fa-fw fa-2x fa-facebook"></i></a>
          <a href="#" ng-cloak="" socialshare socialshare-provider="twitter" socialshare-text="{{topic.title}}"><i class="fa fa-fw fa-2x fa-twitter"></i></a>
          <a href="#" ng-cloak="" socialshare socialshare-provider="vk" socialshare-text="{{topic.title}}"><i class="fa fa-fw fa-2x fa-vk"></i></a>
        </div>
      </div>
    </div>

    <div class="comments">

      <div class="pagination">
        <a class="show-old-comments" ng-click="loadOlderComments()" ng-show="pagination.page < pagination.pages">
          {{'Show earlier comments'|translate}} ({{pagination.total - pagination.page * pagination.limit}})
        </a>
      </div>
      <div class="comments-list" ng-init="firstUser=''" id="commentsList">
        <div class="comment flex-row"
             ng-repeat="comment in (preparedComments = (comments | unique:'_id' | orderBy:'updated'))  track by comment._id"
             id="comment_{{::comment._id}}"
             ng-class="{me: comment.user._id === user._id, lp: preparedComments[$index-1].user._id == comment.user._id, up: preparedComments[$index-1].user._id != comment.user._id, spam: comment.spam, moderated: comment.moderated, solution: comment.solution }"
             itemscope
             itemtype="http://schema.org/Comment"
        >
          <div class="avatar">
            <div ng-hide="{{preparedComments[$index-1].user._id == comment.user._id}}">
              <a ng-href="/users/{{::comment.user.slug}}"><img ng-src="{{::comment.user.picture}}" class="img-responsive"
                alt=""></a>
              <lr-rank user="comment.user"></lr-rank>
            </div>

          </div>
          <div class="flex-column comment-details">
            <div itemprop="author" itemscope itemtype="http://schema.org/Person" class="author" ng-hide="{{::(preparedComments[$index-1].user._id == comment.user._id)}}">
              <a itemprop="name" ng-href="/users/{{::comment.user.slug}}" ng-bind="::comment.user.name"></a>
              <span class="online" ng-show="::comment.user.online" title="Онлайн"><i class="fa fa-circle"></i></span>
            </div>
            <div class="text" itemprop="text" ng-bind-html="::comment.body"></div>
            <div class="text-feedback" ng-show="user">
              <a
                      ng-show="user._id === topic.user._id"
                      ng-click="vote(comment, 'solution')"><i class="fa fa-fw " ng-class="{'fa-check-circle-o': !comment.solution, 'fa-check-circle': comment.solution}"></i></a>
              <a ng-click="vote(comment, 'up')"><i class="fa fa-fw fa-caret-up"></i></a>
              <span ng-bind="comment.rating"></span>
              <a ng-click="vote(comment, 'down')"><i class="fa fa-fw fa-caret-down"></i></a>
              <a ng-click="report(comment)"><i class="fa fa-fw fa-flag"></i></a>
            </div>
            <div class="text-moderation" >
              <a ng-click="moderateComment(comment, btn.label)"
                 ng-repeat="btn in comment.classification track by btn._id"
                 class="moderator button {{::btn.label}}" title="{{::btn.value}}">{{::btn.label}}</a>
            </div>
          </div>
          <div class="date">
            <a class="time hidden-xs"
               name="comment_{{::comment._id}}"
               ng-href="#comment_{{::comment._id}}" target="_self"
                  title="{{::comment.created | date: 'medium'}}" ng-bind="::comment.created | date:'shortTime'"></a>
          </div>
        </div>
      </div>

      <div class="flex-center flex-row">
        <div class="typists">
          <div class="list" ng-show="typists.numberOfKeys()">
            <div class="starter"><i class="fa fa-pencil"></i></div>
            <div class="typist" ng-repeat="typist in typists track by typist._id"><img ng-src="{{::typist.picture}}"
                                                                                       alt="{{::typist.name}}"
                                                                   title="{{::typist.name}}" class="img-responsive"></div>
          </div>
        </div>
      </div>
      <div class="join flex-center" ng-hide="user">
        <div class="welcoming" ng-bind="'Intrigued? Wanna say something?'|translate"></div>
        <div class="flex-row flex-center">
          <users-login-form></users-login-form>
        </div>
      </div>
      <div id="topicAnchor"><span></span></div>
    </div>
  </div>

  <div class="compose flex-row" ng-class="{sending: sending, open: advancedCompose}" ng-show="user">
    <div class="controls">
      <button ng-click="switchAdvancedCompose()" ng-disabled="sending">
        <i class="fa " ng-class="advancedCompose ? 'fa-minus' : 'fa-plus'"></i>
      </button>
    </div>
    <div class="text">
      <lr-editor html="commentText" kp="commentKeyDown(value)"></lr-editor>
    </div>
    <div class="send">
      <button ng-click="sendComment()" ng-disabled="!sendButtonActive"
              title="{{'Press' | translate}} {{$localStorage.sendCommentsCtrl}} {{'to send'|translate}}"
              ng-class="{sending: sending}">
        <i class="fa fa-paper-plane"></i>
      </button>
    </div>
  </div>

</div>



