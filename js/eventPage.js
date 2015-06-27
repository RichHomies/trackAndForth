var messagesRef = new Firebase("https://chromechatapp.firebaseio.com/chat");

// Add a callback that is triggered for each chat message.
messagesRef.limitToLast(25).on("child_added", function (snapshot) {
  var message = snapshot.val();
  var time = moment(message.timeStamp).fromNow();
   if(time === 'a few seconds ago'){
    chrome.browserAction.setIcon({path:"assets/diamond_red.png"});
  }
});

