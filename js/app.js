

var app = angular.module("chatApp", ["firebase", "luegg.directives", 'ui.router', 'ngSanitize'])

.config(function($stateProvider, $urlRouterProvider){

  // For any unmatched url, send to /route1
  $urlRouterProvider.otherwise("/signIn");

  $stateProvider
  .state('home', {
    url: "/",
    templateUrl: "views/register.html"

  })
  .state('signIn', {
    url: "/signIn",
    templateUrl: "views/signIn.html"
  })
  .state('name', {
    url: "/name",
    templateUrl: "views/name.html"
  })
  .state('messages', {
    url: "/messages",
    templateUrl: "views/chatRoom.html",
    controller : "ChatCtrl"
  });
})
.run(function(){
  chrome.browserAction.setIcon({path:"assets/diamond.png"});
})
.factory('User', function ($state, $http) {
    var str = 'https://publicappchat.firebaseio.com/'
    var ref = new Firebase(str + "/chat");
    var userRef = new Firebase(str + '/usersInfo');
    var youTubeRef = new Firebase(str + "/youtube");
    var soundCloudRef = new Firebase(str + "/soundcloud");
  

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

var getSCData = function(url, cb){
  var string = "http://api.soundcloud.com/resolve.json?url=" + url + "&client_id=aa3e10d2de1e1304e62f07feb898e745";

  $http.get(string)
  .success(function(response) {
    cb(response);
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
  getSCData : getSCData
};

})
// .directive('player', [function() {
//   return {
//     restrict: 'AE',
//     templateUrl : ,
//     link: function($scope, $element, $attrs) {
//       $scope.ended = function(){
//         console.log('ended');
//       };
//     }; 
//   }])

// directive('myIframe', function(){
//     var linkFn = function(scope, element, attrs) {
//         element.find('iframe').bind('load', function (event) {
//           ended();
//         });
//     };

//     var ended = function(){
//       console.log('ended');
//     };


//     return {
//       restrict: 'EA',
//       scope: {
//         src:'@src',
//         height: '@height',
//         width: '@width',
//         scrolling: '@scrolling'
//       },
//       template: '<iframe class="frame" height="{{height}}" width="{{width}}" frameborder="0" border="0" marginwidth="0" marginheight="0" scrolling="{{scrolling}}" src="{{src}}"></iframe>',
//       link : linkFn
//     };
//   });

.controller("ChatCtrl", ["$scope", "$firebaseArray", "User", "$state", "$sce", "$http",
  // we pass our new chatMessages factory into the controller
  function($scope, $firebaseArray, User, $state, $sce, $http) {
    $scope.messages = $firebaseArray(User.ref);
    $scope.youtubeLinks =  $firebaseArray(User.youTubeRef);
    $scope.soundcloudLinks =  $firebaseArray(User.soundCloudRef);
    console.log('yt links - ', $scope.youtubeLinks.length);

    $scope.name;

    User.fetchUserObjFromFirebase(function(nameString){
      User.setName(nameString);
      $scope.name = User.getName();
      $scope.$apply();  
    });



    window.ended = function(){
      console.log('ended');
    };

    var els = document.getElementsByTagName('iframe');

    for(var i = 0; i < els.length; i++){
      $scope.$on("onended", ended);
    }

    $scope.ytTrustSrc = function(src) {
      return $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + src);
    };

    $scope.scTrustSrc = function(src) {
      src = "https://w.soundcloud.com/player/?url=" + src + "&color=0066cc";
      return $sce.trustAsResourceUrl(src);
    };


    $scope.$on('LastRepeaterElement', function(){
      console.log('good to go');
    });

    $scope.appliedClass = function(name) {
      if (name === $scope.name) {
        return "rightdiv";
      } else {
            return "leftdiv"; // Or even "", which won't add any additional classes to the element
          }
        };

        $scope.addMessage = function() {
      // calling $add on a synchronized array is like Array.push(),
      // except that it saves the changes to our Firebase database!
      var ts = new Date();
      ts = ts.toString();
      
      User.ref.push({
        name: $scope.name, 
        text: $scope.messageText, 
        timeStamp: ts
      });
      // reset the message input
      $scope.messageText = "";
    };

    $scope.remove = function(url, yt, sc){
      //iterate through array
      //get the index of the element in the list
      //remove that shit
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

      list.$remove(url).then(function(ref) {
        console.log('removed');
      });

    };
    $scope.formatTime = function(dateString){
      var ts = moment(dateString).fromNow();
      return ts;
    };

    $scope.logOff = function(){
      $state.go('signIn');
      User.setAuthObj(null);
      User.setName(null);
      User.unauth();
    }

  }])

.controller("RegisterCtrl", ["$scope", "$firebaseArray", "$state", "User",
  function($scope, $firebaseArray, $state, User){
    var userIsLoggedIn = User.isAuth();
    if(userIsLoggedIn){
      User.setAuthObj(userIsLoggedIn);
      $state.go('messages');
    }

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
    var userIsLoggedIn = User.isAuth();
    if(userIsLoggedIn){
      User.setAuthObj(userIsLoggedIn);
      $state.go('messages');
    }

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

.directive('emitLastRepeaterElement', function() {
  return function(scope) {
    if (scope.$last){
      scope.$emit('LastRepeaterElement');
    }
  };
});





