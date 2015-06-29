var messagesRef = new Firebase("https://chromechatapp.firebaseio.com/chat");
// Add a callback that is triggered for each chat message.
var nameString;

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


function onClickHandler(info, tab) {
  if (info.menuItemId == "radio1" || info.menuItemId == "radio2") {
    console.log("radio item " + info.menuItemId +
                " was clicked (previous checked state was "  +
                info.wasChecked + ")");
  } else if (info.menuItemId == "checkbox1" || info.menuItemId == "checkbox2") {
    console.log(JSON.stringify(info));
    console.log("checkbox item " + info.menuItemId +
                " was clicked, state is now: " + info.checked +
                " (previous state was " + info.wasChecked + ")");

  } else {
    console.log("item " + info.menuItemId + " was clicked");
    console.log("info: " + JSON.stringify(info));
    console.log("tab: " + JSON.stringify(tab));
    //push into chat
  }
};

chrome.contextMenus.onClicked.addListener(onClickHandler);

// Set up context menu tree at install time.
chrome.runtime.onInstalled.addListener(function() {
  // Create one test item for each context type.
  var contexts = ["page","selection","link","editable","image","video",
                  "audio"];
  for (var i = 0; i < contexts.length; i++) {
    var context = contexts[i];
    var title = "Test '" + context + "' menu item";
    var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                         "id": "context" + context});
    console.log("'" + context + "' item:" + id);
  }

});

