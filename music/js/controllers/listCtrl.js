app.controller("listCtrl", ['$scope', '$firebaseArray', "$sce", 'playlist', function($scope, $firebaseArray, $sce, playlist) {
  var str = 'https://wandechatapp.firebaseio.com';
  var youTubeRef = new Firebase(str + "/youtube");
  var soundCloudRef = new Firebase(str + "/soundcloud");
  // download the data into a local object
  $scope.youtubeLinks = $firebaseArray(youTubeRef);
  $scope.soundcloudLinks = $firebaseArray(soundCloudRef);

  $scope.formatTime = function(dateString){
    var ts = new Date(dateString);
    ts = moment(ts).calendar();
    return ts;
  }

  $scope.ytTrustSrc = function(src) {
    return $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + src);
  };

  $scope.scTrustSrc = function(src) {
    src = "https://w.soundcloud.com/player/?url=" + src + "&color=0066cc";
    return $sce.trustAsResourceUrl(src);
  };

  $scope.remove = function(url, yt, sc){
    var list;
    if(yt){
      list = $scope.youtubeLinks;
    } 

    if(sc){
      list = $scope.soundcloudLinks;
    }

    list.$remove(url).then(function(ref) {
      console.log('removed');
    });
  };

  $scope.formatTime = function(dateString){
    var ts = moment(dateString).fromNow();
    return ts;
  };

  $scope.dequeue = function(url){
    console.log('ended - dequeue ', url);
  };



  }]);


