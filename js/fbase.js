var FirebaseMakerFunction =  function() {
  this.refString = 'https://chromechatapp.firebaseio.com';
  this.ref = new Firebase(this.refString);
};

FirebaseMakerFunction.prototype.createUser = function(user, pass, cb){
  console.log('creating user');
  this.ref.createUser({
    email    : user,
    password : pass
  }, function(error, authData) {
    if(error) { 
      console.log("User Creation Failed!", error);
    }  else {
      this.signIn(user, pass, cb);
    }
  }.bind(this));
};

FirebaseMakerFunction.prototype.signIn = function(user, pass, cb){
  console.log('siging in user');
  this.ref.authWithPassword({
    email    : user,
    password : pass
  }, function(error, authData) {
    if (error) {
      console.log("Login Failed!", error);
    } else {
      console.log("Authenticated successfully with payload:", authData);
      userObj = new ChatUser(authData);
      console.log('user :', userObj);
      cb();
    }
  });
};

FirebaseMakerFunction.prototype.checkIfUserIsLoggedIn = function(token, next){
  var authinfo = this.ref.getAuth();
  if (authinfo) {
    userObj = new ChatUser(authinfo);
    userObj.fetchUserObjFromFirebase (function(data){
      console.log(data);
      userObj.saveNameToSpan(data);
      hideShow('signInView', 'messageView');
      hideShow('registerView', 'messageView');
    });
  } else {
    $('#signInView').show();
  }
};

FirebaseMakerFunction.prototype.unauth = function(){
   this.ref.unauth ();
};

var firebaseObj = new FirebaseMakerFunction();
