var messagesRef;
var messages;
var str;
var nameString;
var currentIcon = 'default'; 
var soundcloudQueue;
var currentSong;

var Queue = function() {
  this._storage = {};
  this._head = 0;
  this._tail = 0;
  this._count = 0;
};

Queue.prototype.add = function(elem) {
  this._storage[this._tail] = elem;
  this._tail++;
  this._count++;
};

Queue.prototype.remove = function() {
  if (this._head === this._tail) return null;

  var elem = this._storage[this._head];
  delete this._storage[this._head];
  this._head++;
  this._count--;
  return elem;
};

var setRef = function(ref){
  messagesRef = ref;
}

var setEvents = function(){
  console.log(messagesRef);
  messagesRef.limitToLast(25).on("child_added", function (snapshot) {
    var message = snapshot.val();
    var timeStampAtTimeZero = new Date();
    var timeStampAtNow = new Date(message.timeStamp);
    var elapsedTime = (timeStampAtTimeZero - timeStampAtNow)/1000;
    var myMessage =  message.name === nameString;
    if(elapsedTime < 60*5 && !myMessage){
      updateIcon('newMessage', function(){
        console.log('new message icon');
      });
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

var updateIcon = function (type, cb){

  if(currentIcon === 'playingSong' && type === 'openPopup'){
    type = 'playingSong';
  }

  if(currentIcon === 'playingSong' && type === 'newMessage') {
    currentIcon = 'playingSongNewMessage';
  }

  if(currentIcon === 'playingSong' && type === 'openPopup') {
    type = 'playingSong';
  }

  var iconPaths = {
    'playingSong' : 'assets/audio.png',
    'newMessage' : 'assets/diamond_red.png',
    'default' : 'assets/diamond.png',
    'playingSongNewMessage' : 'assets/audio_red.png',
    'stopPlayingSong' : 'assets/diamond.png',
    'endedSong' : 'assets/diamond.png',
    'pausePlayingSong' : 'assets/diamond.png',
    'openPopup' : 'assets/diamond'
  }

  chrome.browserAction.setIcon({path: iconPaths[type]}, function(){
    cb();
  });
  currentIcon = type;
}

var playSoundcloud = function (song){
  var audioElem = document.getElementById('audioElem');
  var newSoundUrl  = song + "?client_id=aa3e10d2de1e1304e62f07feb898e745";

  if(currentIcon === 'pausePlayingSong') {
    audioElem.play();
  } else  {
    audioElem.src = newSoundUrl;
    audioElem.onended = function(){
      
      console.log('ended');
      var dateStamp = new Date();
      console.log('time ', dateStamp);
      
      updateIcon('endedSong', function(){
        console.log('update icon ended');
        saveCurrenlyPlayingToSyncStorage('', function(){
          playSongQueue();
        });
        
      });

    }
  }

  updateIcon('playingSong', function(){
    console.log('updated icon playing');
  });
}

var stopSoundcloud = function (){
  var audioElem = document.getElementById('audioElem');
  audioElem.src = '';
  saveCurrenlyPlayingToSyncStorage('', function(){
    updateIcon('stopPlayingSong', function(){
      console.log('updated icon stop');
    });
  });
}

var pauseSoundcloud = function () {
  var audioElem = document.getElementById('audioElem');
  audioElem.pause();
  updateIcon('pausePlayingSong', function(){
    console.log('updated icon pause');
  });
}

var makeSongQueue =  function(songs, index){
  soundcloudQueue = new Queue();
  for(var i = index; i < songs.length; i++){
    soundcloudQueue.add(songs[i]);
  }
}

var playSongQueue = function (){
  console.log('soundcloudQueue ', soundcloudQueue);
  console.log('count ', soundcloudQueue._count);
  var song;
  if(soundcloudQueue._count){
    song = soundcloudQueue.remove();
    playSoundcloud(song.stream_uri);
    saveCurrenlyPlayingToSyncStorage(song.title, function(){
      console.log('saved song title to storage');
    });
  }
}

var saveCurrenlyPlayingToSyncStorage = function (song, cb){
    chrome.storage.sync.set({currentlyPlaying: song}, function(){
      var dateStamp = new Date();
      console.log('time ', dateStamp);
      console.log('saved To local storage');
      cb();
    });
}

saveCurrenlyPlayingToSyncStorage('', function(){
  console.log('set song name to empty string');
});


chrome.storage.onChanged.addListener(function(changes, namespace) {
    if(changes['firebaseRef']) {
      console.log(changes['firebaseRef']['newValue']);
      var newFBRef = new Firebase(changes['firebaseRef']['newValue'] +'chat');
      setRef(newFBRef);
      setEvents();
    }
    
});

