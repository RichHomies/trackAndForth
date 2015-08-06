var messagesRef;
var str;
var nameString;
var currentIcon = 'default'; 

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
      updateIcon('newMessage');
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
    var ref = new Firebase(localStorageObject.firebaseRef + "/chat");
    var id;
    var ts = new Date();
    ts = ts.toString();

    var youtubeCheck =  song.split('.');
    if(youtubeCheck[1].substring(0, 7) === 'youtube'){
      id = song.split('=');
      id = id[1];
      pushToFbase(ytref, 'yt', id, ts, ref);
    }

    var soundcloudCheck = song.split('//');
    soundcloudCheck = soundcloudCheck[1].split('.');

    if(soundcloudCheck[0] === 'soundcloud'){
      pushToFbase(scref,'sc', song, ts, ref);
    }
  });
};

var pushToFbase = function(ref, source, id, ts, chatRef){
  if(nameString){
    ref.push({
      name: nameString, 
      text: id, 
      timeStamp: ts
    });
    pushToFbaseChat(source, id, ts, chatRef);
  } else {
    alert('you are not logged in');
  }
};

var pushToFbaseChat = function(source, id, ts, chatRef){
  if(nameString){
    if(source === 'sc'){
      var url = "https://api.soundcloud.com/resolve?url=" + id + "&client_id=aa3e10d2de1e1304e62f07feb898e745&format=json&_status_code_map[302]=200";
      $.getJSON(url, function(data) {
        $.getJSON(data.location, function(response){
          console.log(response);
          chatRef.push({
            name: nameString, 
            text: id, 
            timeStamp: ts, 
            musicSource: source,
            songData: response
          });
        });
      });
    } else {
      chatRef.push({
        name: nameString, 
        text: id, 
        timeStamp: ts, 
        musicSource: source,
        songData: null
      });
    }
  } else {
    alert('you are not logged in');
  }
};

var updateIcon = function (type){
  
  if(currentIcon === 'playingSong' && type === 'default'){
    return;
  }

  if(currentIcon === 'playingSong' && type === 'newMessage') {
    currentIcon = 'playingSongNewMessage';
  }

  var iconPaths = {
    'playingSong' : 'assets/audio.png',
    'newMessage' : 'assets/diamond_red.png',
    'default' : 'assets/diamond.png',
    'playingSongNewMessage' : 'assets/audio_red.png',
    'stopPlayingSong' : 'assets/diamond.png',
    'endedSong' : 'assets/diamond.png',
    'pausePlayingSong' : 'assets/diamond.png'
  }

  chrome.browserAction.setIcon({path: iconPaths[type]});

  currentIcon = type;
}

var addEvents = function (eventType, eventHandler){
    var widgetIframe = document.getElementById('sc-widget');
    widget          = SC.Widget(widgetIframe);
    widget.bind(eventType, eventHandler);
}

// var playSoundcloud = function (song){
//   var widgetIframe = document.getElementById('sc-widget');
//   var newSoundUrl  = "https://w.soundcloud.com/player/?url=" + song + "&amp;auto_play=true&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true";
//   var widget1          = SC.Widget(widgetIframe);

//   if(currentIcon === 'pausePlayingSong') {
//     widget1.play();
//   } else  {
//     widgetIframe.src = newSoundUrl;
//     widget1.bind(SC.Widget.Events.READY, function(){
//       console.log('ended');
//     })
//   }
//   updateIcon('playingSong');
//   console.log(song);
// }

// var stopSoundcloud = function (){
//   var widgetIframe = document.getElementById('sc-widget');
//   widgetIframe.src = '';
//   updateIcon('stopPlayingSong');
// }

// var pauseSoundcloud = function () {
//   var widgetIframe = document.getElementById('sc-widget');
//   widget1          = SC.Widget(widgetIframe);
//   widget1.pause();
//   updateIcon('pausePlayingSong');
// }



var playSoundcloud = function (song){
  var audioElem = document.getElementById('audioElem');
  var newSoundUrl  = song + "?client_id=aa3e10d2de1e1304e62f07feb898e745";
  
  if(currentIcon === 'pausePlayingSong') {
    audioElem.play();
  } else  {
    audioElem.src = newSoundUrl;
    audioElem.onended = function(){
      updateIcon('endedSong');
    }
  }
  updateIcon('playingSong');
}

var stopSoundcloud = function (){
  var audioElem = document.getElementById('audioElem');
  audioElem.src = '';
  updateIcon('stopPlayingSong');
}

var pauseSoundcloud = function () {
  var audioElem = document.getElementById('audioElem');
  audioElem.pause();
  updateIcon('pausePlayingSong');
}


