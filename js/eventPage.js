var messagesRef = new Firebase("https://chromechatapp.firebaseio.com/chat");
// Add a callback that is triggered for each chat message.
messagesRef.limitToLast(25).on("child_added", function (snapshot) {
  var message = snapshot.val();
  var timeStampAtTimeZero = new Date();
  var timeStampAtNow = new Date(message.timeStamp);
  var elapsedTime = (timeStampAtTimeZero - timeStampAtNow)/1000;
  if(elapsedTime < 60*5){
    chrome.browserAction.setIcon({path:"assets/diamond_red.png"});
  }
});
