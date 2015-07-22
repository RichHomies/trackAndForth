var messagesRef;
var str;
var nameString;


var setRef = function(ref){
  messageRef = new Firebase(ref);
  setRef();
}

var setEvents = function(){
  messagesRef.limitToLast(25).on("child_added", function (snapshot) {
    var message = snapshot.val();
    var timeStampAtTimeZero = new Date();
    var timeStampAtNow = new Date(message.timeStamp);
    var elapsedTime = (timeStampAtTimeZero - timeStampAtNow)/1000;
    var myMessage =  message.name === nameString;
    if(elapsedTime < 60*5 && !myMessage){
      chrome.browserAction.setIcon({path:"assets/diamond_red.png"});
    }
  });
};

var onClickHandler = function(info, tab) {
  console.log("item " + info.menuItemId + " was clicked");
  console.log("info: " + JSON.stringify(info));
  console.log("tab: " + JSON.stringify(tab));
    //push into chat
    contextMenuHandlerPushSongToFirebase(info.linkUrl);
  };

  chrome.contextMenus.onClicked.addListener(onClickHandler);

// Set up context menu tree at install time.
chrome.runtime.onInstalled.addListener(function() {
  // Create one test item for each context type.
  var contexts = ["selection"];
  for (var i = 0; i < contexts.length; i++) {
    var context = contexts[i];
    var title = "Share";
    var id = chrome.contextMenus.create({"title": title, "contexts":[context],
     "id": "context" + context});
    console.log("'" + context + "' item:" + id);
  }
});

var contextMenuHandlerPushSongToFirebase = function(song){
  var obj = {};
  obj['firebaseRef'] = true;
  chrome.storage.sync.get(obj, function(localStorageObject){
    var ytref = new Firebase(localStorageObject.firebaseRef + "/youtube");
    var scref = new Firebase(localStorageObject.firebaseRef + "/soundcloud");
    var id;
    var ts = new Date();
    ts = ts.toString();

    var youtubeCheck =  song.split('.');
    if(youtubeCheck[1].substring(0, 7) === 'youtube'){
      id = song.split('=');
      id = id[1];
      pushToFbase(ytref, id, ts);
    }

    var soundcloudCheck = song.split('//');
    soundcloudCheck = soundcloudCheck[1].split('.');

    if(soundcloudCheck[0] === 'soundcloud'){
      pushToFbase(scref, song, ts);
    }
  });
};

var pushToFbase = function(ref, id, ts){
  if(nameString){
    ref.push({
      name: nameString, 
      text: id, 
      timeStamp: ts
    });
  } else {
    alert('you are not logged in');
  }
};





