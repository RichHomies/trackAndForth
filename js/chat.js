// // chrome.extension.getBackgroundPage().chrome.browserAction.setIcon({path:"assets/diamond.png"});

// var messagesRef = new Firebase("https://chromechatapp.firebaseio.com/chat");
// var ref = new Firebase('https://chromechatapp.firebaseio.com');
// var userObj;

// var appendPeaceSignToBody = function(){
//   var img = $('<img id="dynamic">'); 
//   img.attr('src', 'assets/peace.png');
//   img.attr('id', 'peace');
//   img = img[0];
//   $('body').prepend(img);
// }

// var hideShow = function(hide, show){
//   views = {
//     'registerView' : $('#registerView'),
//     'signInView' : $('#signInView'), 
//     'messageView' : $('#messageView'),
//     'nameView' : $('#nameView')
//   };
//   views[hide].fadeOut(250);
//   setTimeout(function(){views[show].show();}, 500);
//   console.log('hideShow - ', hide, '-', show);
// }

// var logFunction = function(func, variablesObject, lineNum){
//   console.log(func);
//   console.log(lineNum);
//   for(var key in variablesObject){
//     console.log(key, ' - ', variablesObject[key]);
//   }
// }

// var clearTextBoxVal = function(array){
//   for(var i = 0; i< array.length; i++){
//     array[i].val('');
//   }
// }

// var clearTextBoxText = function(array){
//   for(var i = 0; i< array.length; i++){
//     array[i].text('');
//   }
// }

// //register user
// $('#registerUser').submit(function(event) {
//   event.preventDefault(); 
//   console.log('registerUser Handler');
//   var user = $('#registerEmail').val();
//   var pass = $('#registerPassword').val();
//   clearTextBoxVal([$('#registerPassword'),$('#registerEmail')]);

//   firebaseObj.createUser(user, pass , function(){
//     hideShow('registerView', 'nameView');
//   });

// });

// //saves User's name in firebase 
// $("#soonToBeNamed").keypress(function (e) {
//   if (e.keyCode == 13) {
//     userObj.saveNameToSpan($("#soonToBeNamed").val());
//     clearTextBoxVal([$("#soonToBeNamed")]);
//     console.log('user - chatName - ', userObj.chatName);
//     userObj.saveUserObjToFirebase(); 
//     hideShow('nameView', 'messageView');
//     e.preventDefault();
//   }
// });

// //sign in user
// $( "#signInUser" ).submit(function( event ) {
//   event.preventDefault();
//   var user = $('#signInEmail').val();
//   var pass = $('#signInPassword').val();
//   clearTextBoxVal([$('#signInEmail'), $('#signInPassword')]);
//   firebaseObj.signIn(user, pass , function(){
//     userObj.fetchUserObjFromFirebase(function(data){
//       userObj.saveNameToSpan(data);
//       hideShow('signInView', 'messageView');
//     });
//   });
// });

// //link to the signIn page
// $( "#linkToSign" ).click(function( event ) {
//   hideShow('registerView', 'signInView');
//   clearTextBoxVal([$('#registerPassword'), $('#registerEmail')]);
// }); 

// //link to register page
// $( "#linkToRegister" ).click(function( event ) {
//   hideShow('signInView', 'registerView');
//   clearTextBoxVal([$('#signInEmail'), $('#signInPassword')]);
// }); 

// //Log off
// $( "#logOff" ).click(function( event ) {
//   hideShow('messageView', 'signInView');
//   userObj.unauth();
//   firebaseObj.unauth();
//   clearTextBoxVal([$('#message'),$(".SpanName")]);
//   clearTextBoxText([$(".SpanName")]);
//   appendPeaceSignToBody();
//   $('#peace').fadeOut(10000);  
//   userObj = null; 
//   var fbRef = firebaseObj.ref;
//   fbRef.unauth();
// }); 

// //Chat Message View JS
// // When the user presses enter on the message input, write message to firebase.
// // $("#messageInput").keypress(function (e) {
// //   if (e.keyCode == 13) {
// //     var text = $("#messageInput").val();
// //     $("#messageInput").val('');
// //     var timeStamp = new Date();
// //     timeStamp = timeStamp.toString();
// //     messagesRef.push({
// //       name: userObj.chatName, 
// //       text: text, 
// //       timeStamp: timeStamp
// //     });
// //   }
// // });

// // // Add a callback that is triggered for each chat message.
// // messagesRef.limitToLast(25).on("child_added", function (snapshot) {
// //   var message = snapshot.val();
// //   var time = moment(message.timeStamp).fromNow();
// //   $("<div/>").text(message.text).prepend($("<em/>")
// //     .text(time + ' - ' + message.name + ": ")).appendTo($("#messagesDiv"));
// //   $("#messagesDiv")[0].scrollTop = $("#messagesDiv")[0].scrollHeight;
// // });









// firebaseObj.checkIfUserIsLoggedIn();




