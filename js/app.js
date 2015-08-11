var app = angular.module("chatApp", ["firebase", "luegg.directives", 'ui.router', 'ngSanitize'])

.config(function($stateProvider, $urlRouterProvider, $compileProvider){

  $urlRouterProvider.otherwise("/firebase");


  $stateProvider
  .state('home', {
    url: "/",
    templateUrl: "views/register.html"
  })
  .state('firebase', {
    url: "/firebase",
    templateUrl: "views/getFirebaseRef.html",
    controller: "firebaseCtrl"
  })
  .state('signIn', {
    url: "/signIn",
    templateUrl: "views/signIn.html"
  })
  .state('name', {
    url: "/name",
    templateUrl: "views/name.html"
  })
  .state('help', {
    url: "/help",
    templateUrl: "views/help.html",
    controller: "helpCtrl"
  })
  .state('messages', {
    url: "/messages",
    templateUrl: "views/chatRoom.html",
    controller : "ChatCtrl"
  });

  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);

})
.run(function(User, $state){
  chrome.extension.getBackgroundPage().updateIcon('openPopup', function(){
    console.log('opened popup');
  });
    User.fetchFromLocalStorage(function(localStorageObject){
      var refExists = localStorageObject.firebaseRef;
      refExists = '' + refExists; 
      if(refExists){
        var firebaseIdentifier = refExists.split('.');
        firebaseIdentifier = firebaseIdentifier[1];
        if(firebaseIdentifier === 'firebaseio'){
          User.setStr(refExists);
          User.initRef();
          console.log('run check ref exists');
          var userIsLoggedIn = User.isAuth();
          if(userIsLoggedIn){
            User.setAuthObj(userIsLoggedIn);
            User.initAuthDependentRef();
            console.log('run check user is logged in');
            $state.go('messages');
          } else {
            console.log('run check user is not logged in');
            $state.go('signIn');
          }
        } else {
          console.log('invalid firebase reference string, need to set a new reference string');
          $state.go('firebase');       
        }

      } else {
        console.log('run check, fb ref does not exist');
        $state.go('firebase');
      }
    });
  

})
.factory('User', function ($state, $http) {
  var str = '';
  var ref;
  var userRef;
  var youTubeRef;
  var soundCloudRef;
  var favoriteMusicRef;
  var authDataObj;
  var name;

  var setName = function(nameStr){
    name = nameStr;
    chrome.extension.getBackgroundPage().nameString = nameStr;
  }

  var getName = function(){
    return name;
  }

  var setAuthObj = function(obj){
    authDataObj = obj;
  }

  var getAuthObj = function(){
    return authDataObj;
  }
  //pick up from up here
  var saveUserObjToFirebase = function() {
    userRef.child(authDataObj.uid).set(name);
  };

  var fetchUserObjFromFirebase = function(cb) {
    var auth = this.getAuthObj();
    userRef.child(auth.uid).once('value', function(nameSnapshot) {
      name = nameSnapshot.val();
      cb(name);
    });
  };

  var unauth = function(){
   ref.unauth();
   chrome.extension.getBackgroundPage().nameString = '';
 };

 var isAuth = function(){
  var obj = ref.getAuth();
  if(obj === null){
    return false;
  } else {
    return obj;
  }
};

var registerUser = function(username, password, cb) {
  ref.createUser({
    email: username,
    password: password
  }, function(error, authData) {
    cb(error, authData);
  });
};

var signIn = function(username, password, cb) {
  ref.authWithPassword({
    email: username,
    password: password
  }, function(error, authData) {
    cb(error, authData);
  });
};

var initRef = function(){
  ref = new Firebase(str + "/chat");
  userRef = new Firebase(str + '/usersInfo');
  youTubeRef = new Firebase(str + "/youtube");
  soundCloudRef = new Firebase(str + "/soundcloud");
}

var initAuthDependentRef =  function(){
  favoriteMusicRef = new Firebase(str + 'favoriteMusic/' + ref.getAuth().uid);
}

var setStr = function(data){
  str = data;
}

var getRef = function(){
  return {
    ref : ref,
    userRef : userRef,
    youTubeRef : youTubeRef,
    soundCloudRef : soundCloudRef,
    favoriteMusicRef : favoriteMusicRef
  };
}

var fetchFromLocalStorage =  function(cb){
  var obj = {};
  obj['firebaseRef'] = true;
  chrome.storage.sync.get(obj, function(localStorageObject){
    cb(localStorageObject);
  });
}

return {
  saveUserObjToFirebase : saveUserObjToFirebase,
  fetchUserObjFromFirebase : fetchUserObjFromFirebase,
  unauth : unauth,
  registerUser : registerUser,
  signIn : signIn,
  setName : setName,
  getName : getName,
  setAuthObj : setAuthObj,
  getAuthObj : getAuthObj,
  ref : ref,
  isAuth : isAuth,
  youTubeRef: youTubeRef,
  soundCloudRef : soundCloudRef,
  setStr : setStr,
  getRef : getRef,
  fetchFromLocalStorage : fetchFromLocalStorage, 
  initRef : initRef,
  initAuthDependentRef : initAuthDependentRef
};


}).
factory('localStorage', function(){


  var saveToLocalStorage = function (obj, cb) {
    chrome.storage.sync.set(obj, function(){
      console.log('saved to Localstorage. Object: ',obj);
      cb();
    });
  }

  var fetchFromLocalStorage = function (property, cb) {
    chrome.storage.sync.get(property, function(localStorageObject){
      if(localStorageObject.property !== undefined){
        cb(localStorageObject.property);
      } else {
        console.log(property, ' key not found in local storage');
      }
    });
  }


  var onChangeInLocalStorage =  function (property, cb){
    chrome.storage.onChanged.addListener(function(changes, namespace) {
      if(changes[property]){
        cb(changes['property']['newValue']);
      }
    });
  }

  return {
    saveToLocalStorage : saveToLocalStorage,
    fetchFromLocalStorage : fetchFromLocalStorage,
    onChangeInLocalStorage : onChangeInLocalStorage
  };

})
.controller("ChatCtrl", ["$scope","$firebaseArray", "User", "$state", "$sce", "$http", "$anchorScroll", "$location", "$timeout",
  // we pass our new chatMessages factory into the controller
  function($scope, $firebaseArray, User, $state, $sce, $http, $anchorScroll, $location, $timeout) {
    var obj = User.getRef();
    console.log(obj);

    var updateTitle = function(songTitle){
      $scope.songPlaying = true;
      $scope.songTitle = songTitle;
      songTitle = songTitle ? 'Currently Playing: ' + songTitle : 'chattin n shit';
      chrome.browserAction.setTitle({title:songTitle});
      $scope.$apply();
    }

    chrome.storage.sync.get('currentlyPlaying', function(localStorageObject){
      if(localStorageObject.currentlyPlaying !== undefined){
        updateTitle(localStorageObject.currentlyPlaying);
      };
    });

    chrome.storage.onChanged.addListener(function(changes, namespace) {
      if(changes['currentlyPlaying']){
        updateTitle(changes['currentlyPlaying']['newValue']);
      }
    });

    chrome.storage.onChanged.addListener(function(changes, namespace) {
      if(changes['firebaseRef']){
        //validate ref
        //update the app
        var firebaseIdentifier = changes['firebaseRef'].newValue.split('.');
        firebaseIdentifier = firebaseIdentifier[1];
        if(firebaseIdentifier === 'firebaseio'){
          User.setStr(changes['firebaseRef']);
          User.initRef();
          console.log('run check ref exists');
          var userIsLoggedIn = User.isAuth();
          if(userIsLoggedIn){
            User.setAuthObj(userIsLoggedIn);
            User.initAuthDependentRef();
            console.log('run check user is logged in');
            $state.go('messages');
          } else {
            console.log('run check user is not logged in');
            $state.go('signIn');
          }
        } else {
          console.log('invalid firebase reference string, need to set a new reference string');
          $state.go('firebase');       
        }
      }
    });




    var mapArray = function(arr) {
      var output = [[arr[0]]];
      var outerIndex = 0;
      var current = output[0].name;
      for(var i = 0; i < arr.length; i++){
        if(current === arr[i].name){
          output[outerIndex].push(arr[i]);
        } else {
          current = arr[i].name;
          outerIndex++;
          output.push([arr[i]]);
          console.log('mapArray console log output ', output);
        }
      }
      return output;
    }

    var getInfo = function(track_url, cb){
      console.log(track_url);
      var url = "https://api.soundcloud.com/resolve?url=" + track_url + "&client_id=aa3e10d2de1e1304e62f07feb898e745&format=json&_status_code_map[302]=200";
      $.getJSON(url, function(data) {
        $.getJSON(data.location, function(response){
          console.log(response);
        });
      });
    }

    var makePlaylist = function(songArray){
      var arrayData = [];
      console.log('songArray makePlaylist ', songArray);
      for(var i = 0; i < songArray.length; i++){
        if(songArray[i].source === 'sc'){
          arrayData.push({
            stream_uri: songArray[i]['songData']['stream_url'],
            title: songArray[i]['songData']['title']
          });      
        }
      }
      return arrayData;
    }

    var scrollToLastChat = function(){
      $timeout(function(){
        var elems = document.getElementsByClassName('chats');
        var elem = elems[elems.length - 1];
        elem.scrollIntoView();
        console.log('scrolled');
      }, 100);
    }

    SC.initialize({
      client_id: 'aa3e10d2de1e1304e62f07feb898e745'
    });

    $scope.name;
    $scope.messages = $firebaseArray(obj.ref);
    $scope.youtubeLinks = $firebaseArray(obj.youTubeRef);
    $scope.soundcloudLinks = $firebaseArray(obj.soundCloudRef);
    $scope.favorites = $firebaseArray(obj.favoriteMusicRef);

    $scope.messages.$loaded()
    .then(function(data) {
      $scope.messages = data;
      $timeout(function(){
        $scope.obj['loadingComplete'] = true;
        scrollToLastChat();
      }, 100);
    })
    .catch(function(error) {
      console.log("Error:", error);
    });

    $scope.$on('LastRepeaterElement', function(){
    });

    console.log('messages ', $scope.messages);



    User.fetchUserObjFromFirebase(function(nameString){
      User.setName(nameString);
      $scope.name = User.getName();
      $scope.$apply();  
    });


    $scope.ytTrustSrc = function(src) {
      return $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + src);
    };

    $scope.scTrustSrc = function(src) {
      src = "https://w.soundcloud.com/player/?url=" + src + "&color=0066cc";
      return $sce.trustAsResourceUrl(src);
    };

    $scope.trustSrc = function(src) {
      console.log($sce.trustAsResourceUrl(src));
      return $sce.trustAsResourceUrl(src);
    };



    $scope.addMessage = function(val) {
      var ts = new Date();
      ts = ts.toString();
      console.log(val);
      obj.ref.push({
        name: $scope.name, 
        text: $scope.obj.messageText, 
        timeStamp: ts,
        musicSource: false
      });

      $scope.obj.messageText = "";
      scrollToLastChat();

    };

    $scope.remove = function(url, yt, sc, fav){
      var list;
      if(yt){
        list = $scope.youtubeLinks;
        console.log('yt');
      } 

      if(sc){
        list = $scope.soundcloudLinks;
        console.log('sc');
        console.log(list);
        console.log(url);
      }

      if(fav){
        list = $scope.favorites;
        console.log('fav');
        console.log(list);
        console.log(url);
      }

      list.$remove(url).then(function(ref) {
        console.log('removed');
      });

    };

    $scope.formatTime = function(dateString){
      var ts = moment(dateString).fromNow();
      return ts;
    };

    $scope.show = function(isShowing){
      return !isShowing;
    };

    $scope.logOff = function(){
      $scope.stopSong();
      $state.go('signIn');
      User.setAuthObj(null);
      User.setName(null);
      User.unauth();
    }

    $scope.goToGetFirebaseRef = function(){
      $state.go('firebase');
    }

    $scope.submitFeedback = function(feedback){
      var submitRef = new Firebase('https://feedbackapp.firebaseio.com/');
      var ts = new Date();
      console.log($scope);
      console.log(dataObj);
      submitRef.push({
        name: $scope.name, 
        text: $scope.feedbackText, 
        timeStamp: ts,
        app: 'chat'
      });

      $scope.response = 'Thanks!';
      $scope.$apply();
      $scope.showHelp = false;
      $scope.feedbackText = '';

    }

    $scope.hrefTag = function(href){
      return '#' + $sce.trustAsResourceUrl(href);
    }

    $scope.addToFavorites = function(song , source, songData){
      obj.favoriteMusicRef.push({
        song : song,
        source: source,
        name: $scope.name,
        songData : songData
      });
    }

    $scope.playSongs = function(song, favorites, songFav){
      var index = _.findIndex(favorites, function(chr) {
        return chr == songFav;
      });
      var playList = makePlaylist(favorites);
      console.log('index ', index);
      console.log('playlist ', playList);
      chrome.extension.getBackgroundPage().makeSongQueue(playList, index);
      chrome.extension.getBackgroundPage().playSongQueue();
    }

    $scope.playSong = function(song, title){
      chrome.extension.getBackgroundPage().playSoundcloud(song);
      chrome.extension.getBackgroundPage().saveCurrenlyPlayingToSyncStorage(title, function(){
        console.log('saved song name ', title);
      });
    }


    $scope.stopSong = function(){
      chrome.extension.getBackgroundPage().stopSoundcloud();
    }

    $scope.pauseSong = function(){
      chrome.extension.getBackgroundPage().pauseSoundcloud();
    }    



  }])

.controller("RegisterCtrl", ["$scope", "$firebaseArray", "$state", "User",
  function($scope, $firebaseArray, $state, User){

    $scope.registerUser = function(username, password) {
      $scope.registerEmail = '';
      $scope.registerPassword = '';
      User.registerUser(username, password, function(error, authData) {
        if(error) { 
          console.log("Error creating user", error);
          $scope.error = error.message;
          $scope.$apply();
        } else {
          console.log("registered user");
          User.signIn(username, password, function(error, authDataFb) {
            if (error) {
              console.log("Login Failed!", error);
              $scope.error = error.message;
              $scope.$apply();
            } else {
              User.setAuthObj(authDataFb);
              User.initAuthDependentRef();
              console.log('registerCtrl ' + User.getAuthObj().toString());
              $state.go('name');
            }
          });
        }
      });
    };

    $scope.goToSignIn = function(){
      $state.go('signIn');
    };

  }])

.controller("SignInCtrl", ["$scope", "$firebaseArray", "$state", "User",
  function($scope, $firebaseArray, $state, User){

    $scope.signIn = function(username, password) {
      $scope.signInEmail = '';
      $scope.signInPassword = '';
      User.signIn(username, password, function(error, authData) {
        if (error) {
          console.log("Login Failed!", error);
          $scope.error = error.message;
          $scope.$apply();
        } else {
          console.log(authData);
          User.setAuthObj(authData);
          User.initAuthDependentRef();
          $state.go('messages');
        }
      });
    };

    $scope.goToRegister = function(){
      $state.go('home');
    };

  }])

.controller("NameCtrl", ["$scope", "$firebaseArray", "$state", "User",
  function($scope, $firebaseArray, $state, User){
    // angular.extend($scope, User);
    $scope.saveName = function(name){
      User.setName(name);
      User.saveUserObjToFirebase();
      soonToBeNamed = '';
      $state.go('messages');
    };        

  }])
.controller("firebaseCtrl", ["$scope", "$state", "User", "localStorage",
  function($scope, $state, User, localStorage){

    $scope.update = function(){
      var temp = $scope.stringRef;
      temp = temp.split('.');
      if(temp[temp.length - 2] === 'firebaseio'){
        User.setStr($scope.stringRef);
        User.initRef();
        $state.go('signIn');
      } 
      $scope.stringRef = '';
    }; 

    $scope.help = function(){
      $state.go('help');
    }       

    $scope.saveToLocalStorage =  function(){
      var obj = {};
      var temp = $scope.stringRef;
      temp = temp.split('.');
      if(temp[temp.length - 2] === 'firebaseio'){
        obj['firebaseRef'] = $scope.stringRef;
        $scope.stringRef = '';
        chrome.storage.sync.set(obj, function(){
          console.log('saved firebase reference');
          $state.go('signIn');
        });
      } else  {
          //set error
          $scope.error = 'invalid firebase reference';
        }
      }

    }])
.controller("helpCtrl", ["$scope", "$firebaseArray", "$state", "User",
  function($scope, $firebaseArray, $state, User){
    $scope.goBack =  function(){
      $state.go('firebase');
    }
  }])
.directive('emitLastRepeaterElement', function() {
  return function(scope) {
    if (scope.$last){
      scope.$emit('LastRepeaterElement');
    }
  };
})
.directive('scrollIf', function () {
  return function (scope, element, attributes) {
    setTimeout(function () {
      if (scope.$eval(attributes.scrollIf)) {
        var elem = document.getElementById(attributes.id).parentElement;
        elem.scrollIntoView();
      }
    });
  }
});





