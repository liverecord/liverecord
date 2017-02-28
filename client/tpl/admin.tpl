<div class="topic-view" ng-class="{advancedcompose: advancedCompose, private: topic.private}">
  <div class="topic" id="topic">

    JS Box (only admins can broadcast it)     <button ng-click="broadcastCommand()">Run on all clients</button>
    <hr>
    <textarea placeholder="Put any JS here" cols="80" rows="20" ng-model="command"></textarea>

  </div>
</div>



