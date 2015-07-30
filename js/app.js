//Sign in is not working

var app = angular.module("chatApp", ["firebase", "luegg.directives", 'ui.router', 'ngSanitize'])

.config(function($stateProvider, $urlRouterProvider, $compileProvider){

  // For any unmatched url, send to /route1
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
  chrome.browserAction.setIcon({path:"assets/diamond.png"});
  User.fetchFromLocalStorage(function(localStorageObject){
      var refExists = localStorageObject.firebaseRef;
      refExists = '' + refExists; 
      console.log(refExists);
      if(refExists){
        var firebaseIdentifier = refExists.split('.');
        firebaseIdentifier = firebaseIdentifier[1];
        if(firebaseIdentifier === 'firebaseio'){
          User.setStr(refExists);
          console.log('run check ref exists');
          var userIsLoggedIn = User.isAuth();
          if(userIsLoggedIn){
            User.setAuthObj(userIsLoggedIn);
            console.log('run check user is logged in');
            $state.go('messages');
          } else {
            console.log('run check user is not logged in');
            $state.go('signIn');
          }
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
  favoriteMusicRef = new Firebase(str + 'favoriteMusic/' + ref.getAuth().uid);
}

var setStr = function(data){
  str = data;
  initRef();
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
  fetchFromLocalStorage : fetchFromLocalStorage
};

})

.controller("ChatCtrl", ["$scope", "$firebaseArray", "User", "$state", "$sce", "$http", "$anchorScroll", "$location",
  // we pass our new chatMessages factory into the controller
  function($scope, $firebaseArray, User, $state, $sce, $http, $anchorScroll, $location) {
    var obj = User.getRef();
    console.log(obj);

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

    $scope.name;
    $scope.messages = $firebaseArray(obj.ref);
    $scope.youtubeLinks = $firebaseArray(obj.youTubeRef);
    $scope.soundcloudLinks = $firebaseArray(obj.soundCloudRef);
    $scope.favorites = $firebaseArray(obj.favoriteMusicRef);

    $scope.messages.$loaded()
    .then(function(data) {
      console.log('loaded ',$scope.messages === data); // true
      $scope.messages = data;
    })
    .catch(function(error) {
      console.log("Error:", error);
    });

    $scope.$on('LastRepeaterElement', function(){
    });

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

    $scope.addMessage = function() {
      var ts = new Date();
      ts = ts.toString();
      console.log(obj);
      obj.ref.push({
        name: $scope.name, 
        text: $scope.messageText, 
        timeStamp: ts,
        musicSource: false
      });

      // reset the message input
      $scope.messageText = "";
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
      $state.go('signIn');
      User.setAuthObj(null);
      User.setName(null);
      User.unauth();
    }

    $scope.goToGetFirebaseRef = function(){
      $state.go('firebase');
    }

    $scope.submitFeedback = function(){
      var submitRef = new Firebase('https://feedbackapp.firebaseio.com/');
      var ts = new Date();
      submitRef.push({
        name: $scope.name, 
        text: $scope.feedbackText, 
        timeStamp: ts,
        app: 'chat'
      });

      $scope.response = 'Thanks!';
      $scope.$apply();
      $scope.showHelp = false;

    }

    $scope.hrefTag = function(href){
      return '#' + $sce.trustAsResourceUrl(href);
    }

    $scope.addToFavorites = function(song , source){
      obj.favoriteMusicRef.push({
        song : song,
        source: source,
        name: $scope.name
      });
    }



  }])

.controller("RegisterCtrl", ["$scope", "$firebaseArray", "$state", "User",
  function($scope, $firebaseArray, $state, User){
    $scope.$apply();

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
              console.log('registerCtrl ' + User.getAuthObj().toString());
              $state.go('name');
            }
          });
        }
      });
    };

    $scope.goToSignIn = function(dateString){
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
          $state.go('messages');
        }
      });
    };

    $scope.goToRegister = function(dateString){
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
.controller("firebaseCtrl", ["$scope", "$firebaseArray", "$state", "User",
  function($scope, $firebaseArray, $state, User){

      $scope.update = function(){
        var temp = $scope.stringRef;
        temp = temp.split('.');
        if(temp[temp.length - 2] === 'firebaseio'){
          User.setStr($scope.stringRef);
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
        // window.scrollTo(0, element[0].offsetTop - 250);
        var elem = document.getElementById(attributes.id).parentElement;
        elem.scrollIntoView();
      }
    });
  }
});





