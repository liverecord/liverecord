<div class="topic-view" ng-class="{advancedcompose: advancedCompose, private: topic.private}">
  <div class="topic" id="topic">

    <nav>
      <a href="/admin/users/">Users</a>
      <a href="/admin/console/">Console</a>
      <a href="/admin/comments/">Comments</a>
      <a href="/admin/topics/">Topics</a>
      <a href="/admin/parameters/">Parameters</a>
      <a ng-click="bayes()">Retrain</a>
    </nav>
    
    
    JS Box (only admins can broadcast it)     <button ng-click="broadcastCommand()">Run on all clients</button>
    <hr>
    <textarea placeholder="Put any JS here" cols="80" rows="20" ng-model="command"></textarea>

  </div>
</div>



