//log off button sends user to hall. Fix this.
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
    templateUrl: "views/signIn.html",
    controller: "SignInCtrl"
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
  })
  .state('hall', {
    url: "/hall",
    templateUrl: "views/hall.html",
    controller : "hallCtrl"
  })
  .state('createRoom', {
    url: "/createRoom",
    templateUrl: "views/createRoom.html",
    controller : "hallCtrl"
  });

  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);

})
.run(function(User, $state, $rootScope){


  User.fetchFromLocalStorage(function(localStorageObject){
    chrome.extension.getBackgroundPage().updateIcon('openPopup', function(){
      console.log('openPopup');
    });

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
  var rootRef;
  var ref;
  var userRef;
  var messageRef;
  var favoriteMusicRef;
  var authDataObj;
  var name;
  var roomName;

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
    rootRef.child('names').child(authDataObj.uid).set(name);
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
   rootRef.unauth();
   chrome.extension.getBackgroundPage().nameString = '';
   chrome.extension.getBackgroundPage().currentRoom = '';
 };

 var isAuth = function(){
  var obj = rootRef.getAuth();
  if(obj === null){
    return false;
  } else {
    return obj;
  }
};

var registerUser = function(username, password, cb) {
  rootRef.createUser({
    email: username,
    password: password
  }, function(error, authData) {
    cb(error, authData);
  });
};

var signIn = function(username, password, cb) {
  rootRef.authWithPassword({
    email: username,
    password: password
  }, function(error, authData) {
    cb(error, authData);
  });
};

var initRef = function(){
  rootRef = new Firebase(str);
  ref = rootRef.child('rooms').child('roomName');
  userRef = ref.child('users');
  messageRef = ref.child('messages');
}

var initAuthDependentRef =  function(){
  favoriteMusicRef = ref.child('favorites').child(ref.getAuth().uid);
}

var arrOfRoomsAndUsers = function(){
  var arr = _.map
}

var setStr = function(data){
  str = data;
}


var getRef = function(roomName){
  return {
    rootRef : rootRef,
    ref : rootRef.child('rooms').child(roomName),
    userRef : rootRef.child('rooms').child(roomName).child('users'),
    messageRef : rootRef.child('rooms').child(roomName).child('messages'),
    favoriteMusicRef : rootRef.child('rooms').child(roomName).child('favorites').child(ref.getAuth().uid)
  };
}


var fetchFromLocalStorage =  function(cb){
  var obj = {};
  obj['firebaseRef'] = true;
  chrome.storage.sync.get(obj, function(localStorageObject){
    cb(localStorageObject);
  });
}

var userNameIsUnique = function(name, cb){//update
  rootRef.child('names').on('value', function(snapshot){
    var names = {};
    var nameIsTaken = _.includes(snapshot.val(), name, 0);
    cb(null, nameIsTaken);
  }, function (errorObject) {
    cb(errorObject);
  });
}

var createRoom = function(rmName){
    rootRef.child('rooms').child(rmName).child('names').child(authDataObj.uid).set(name);
    chrome.extension.getBackgroundPage().currentRoom = rmName;
}

var goToRoom = function(rmName){
  var roomRef = rootRef.child('rooms').child(rmName).child('messages');
  rootRef.child('rooms').child(rmName).child('names').child(authDataObj.uid).set(name);
  chrome.extension.getBackgroundPage().currentRoom = rmName;
  chrome.extension.getBackgroundPage().setRef(roomRef);
  chrome.extension.getBackgroundPage().setEvents();
}

var getRoomName = function(){
  return chrome.extension.getBackgroundPage().currentRoom;
}

var getRootRef = function(){
  return rootRef;
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
  setStr : setStr,
  getRef : getRef,
  fetchFromLocalStorage : fetchFromLocalStorage, 
  initRef : initRef,
  initAuthDependentRef : initAuthDependentRef,
  userNameIsUnique : userNameIsUnique,
  createRoom : createRoom,
  getRoomName: getRoomName,
  getRootRef : getRootRef,
  goToRoom  : goToRoom
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
.factory('Refs', function(localStorage){


/*
var rootRef = new Firebase('https://testchatchat.firebaseio.com');
var usersRef = rootRef.child('users');
var userNamesRef = usersRef.child('names');
var userUsersInfoRef = usersRef.child('usersInfo');
var chatRoom1Ref = rootRef.child('chatRoom1')
var chatRoom1MessagesRef = chatRoom1Ref.child('messages');
var chatRoom1UsersRef = chatRoom1Ref.child('users');
var chatRoom1FavoritesRef = chatRoom1Ref.child('favorites');
var roomsRef = rootRef.child('rooms');
var roomNamesRef = roomsRef.child('roomNames');
var roomRoomsInfoRef = roomsRef.child('roomsInfo');

ref-users-name:
  ~
  create data --> 
    userNamesRef.child('simpleLogin').set('name');
  ~
  read data --> 
    var syncUserNamesRef = $firebaseArray(userNamesRef)
    userNamesRef.once("value", function(data) {
      //gives you all of the user's names
      console.log(data.val());
    });
  ~
  update --> 
    userNamesRef.child('simpleLogin').set('name');
  ~
  destroy -->
    $firebaseArray(userNamesRef).$remove(key)



ref-users-usersInfo:
  ~
  create data --> 
    uid-->
      userUsersInfoRef.child('realName').child('simpleLogin').set('simpleLogin')
    rooms-->
      userUsersInfoRef.child('realName').child('rooms').child('roomName').set('roomName')
  ~
  read data --> 
    var syncUserUserInfoRef = $firebaseArray(userUsersInfoRef)
    userUsersInfoRef.child('realName').child('rooms').once("value", function(data) {
      //gives you all of the user's names
      console.log(data.val());
    });
  ~
  update --> 
    name-->
      userUsersInfoRef.child('realName').child('simpleLogin').set('simpleLogin')
    rooms-->
      userUsersInfoRef.child('realName').child('rooms').child('roomName').set('roomName')
      
  ~
  destroy -->
    $firebaseArray(userUsersInfoRef.child('-JxpVGLwVtKQnBgd7gw0')).$remove(key)


ref-chat1:

  create data -->
    message-->
      chat
      chatRoom1MessagesRef.push({
        name: $scope.name, 
        text: $scope.obj.messageText, 
        timeStamp: ts,
        musicSource: false
      });
    users-->
      chatRoom1UsersRef.child('simpleLogin1').set('simpleLogin1')
    favorites -->
      chatRoom1FavoritesRef.child('realName').push({
        song : 'song',
        source: 'source',
        name: 'name',
        songData : 'songData'
      });
  read data -->
    var syncChatRoom1Ref = $firebaseArray(chatRoom1Ref)


ref-rooms:
  
  create data -->
    room -->
      roomRoomsInfoRef.child('realRoomName').set('realRoomName');
    users -->
      roomRoomsInfoRef.child('realRoomName').child('users').child('simpleLogin1').set('realName')
    roomNames -->
      roomNamesRef.child('roomName1').set('roomName1');

  read data -->
    roomNames -->
      roomNamesRef.once("value", function(data) {
        //gives you all of the user's names
        console.log(data.val());
      });

    room -->
      roomRoomsInfoRef.once("value", function(data) {
        //gives you all of the user's names
        console.log(data.val());
      });

*/




})

.controller("ChatCtrl", ["$scope","$firebaseArray", "User", "$state", "$sce", "$http", "$anchorScroll", "$location", "$timeout",
  // we pass our new chatMessages factory into the controller
  function($scope, $firebaseArray, User, $state, $sce, $http, $anchorScroll, $location, $timeout) {
    //get firebase references, such that we can leverage them addmessage, 
    if(chrome.extension.getBackgroundPage().currentRoom !== '') {
      var obj = User.getRef(chrome.extension.getBackgroundPage().currentRoom);
    } else {
      $state.go('hall');
    }

    //get's the user's name and sets the name to controller
    User.fetchUserObjFromFirebase(function(nameString){
      if(nameString){
        User.setName(nameString);
        $scope.name = User.getName();
        $scope.$apply();  
      } else {
        $state.go('name');
      }
    });

    var updateTitle = function(songTitle){
      $scope.songPlaying = true;
      $scope.obj['songTitle'] = songTitle;
      songTitle = songTitle ? 'Currently Playing: ' + songTitle : 'chattin n shit';
      chrome.browserAction.setTitle({title:songTitle});
      $scope.$apply();
    }

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

    $scope.name;
    $scope.messages = $firebaseArray(obj.messageRef);
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
      obj.messageRef.push({
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

    $scope.logOff = function(e){
      $state.go('signIn');
      $scope.stopSong();
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

    $scope.resumeSong = function(){
      chrome.extension.getBackgroundPage().resumeSoundcloud();
    }   

    $scope.openTab = function (uri){
      console.log(uri);
      var tarea = uri;
      if (tarea.indexOf("http://") === 0 || tarea.indexOf("https://")=== 0) {
        chrome.tabs.create({url: uri});
      } else {
        chrome.tabs.create({url: 'http://' + uri});
      }
    }

  }])

.controller("RegisterCtrl", ["$scope", "$firebaseArray", "$state", "User",
  function($scope, $firebaseArray, $state, User){
    
    $scope.obj = {
      loading: false
    }

    $scope.registerUser = function(username, password) {
      $scope.registerEmail = '';
      $scope.registerPassword = '';
      $scope.obj.loading = true;

      User.registerUser(username, password, function(error, authData) {
        if(error) { 
          console.log("Error creating user", error);
          $scope.error = error.message;
          $scope.obj.loading = false;
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
    $scope.obj = {
      loading: false
    }

    $scope.signIn = function(username, password) {
      $scope.signInEmail = '';
      $scope.signInPassword = '';
      //need to add loading
      $scope.obj.loading = true;
      User.signIn(username, password, function(error, authData) {
        if (error) {
          console.log("Login Failed!", error);
          $scope.error = error.message;
          $scope.obj.loading = false;
          $scope.$apply();
        } else {
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

    $scope.saveName = function(name){
      if(name.length < 20){
        User.userNameIsUnique(name, function(error, isNameNotAvailable){
          if(error){
            console.log(error);
            $scope.error = 'We made an error, please resubmit your name.';
          }

          if(isNameNotAvailable) {
            $scope.error = name + ' is already taken. Please try again.';
          } else {
            User.setName(name);
            User.saveUserObjToFirebase();
            soonToBeNamed = '';
            $state.go('hall');
          }

        });
      } else {
        $scope.error = 'Name must be less than 20 characters';
      }


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
          User.setStr(obj['firebaseRef']);
          User.initRef();
          $state.go('signIn');
        });
      } else  {
          //set error
          $scope.error = 'invalid firebase reference';
        }
      }

    }])
.controller("helpCtrl", ["$scope", "$firebaseArray", "$state", "User", "$sce",
  function($scope, $firebaseArray, $state, User, $sce){
    $scope.links = {
      firebase: "St5Au55t17M", 
      howTo: "jYJprzXsZU4"
    };    

    $scope.goBack =  function(){
      $state.go('firebase');
    }

    $scope.ytTrustSrc = function(src) {
      return $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + src);
    };


  }])
.controller("hallCtrl", ["$scope", "$firebaseArray", "$state", "User", "$sce",
  function($scope, $firebaseArray, $state, User, $sce){

    
    var rootRef = User.getRootRef();


    rootRef.once('value', function(data){
      var rooms = data.val().rooms;
      console.log(rooms)
      $scope.rooms = rooms;
      $scope.$apply();
    });


    $scope.createRoom = function(){
      User.createRoom($scope.roomName);
      $scope.roomName = '';
      $state.go('messages');
    }

    $scope.goToRoom = function(room){
      User.goToRoom(room);

      $state.go('messages');
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



