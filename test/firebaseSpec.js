describe('localStorage Factory', function() { 
  beforeEach(module('chatApp'));

  var ctrl, storage; 
  
  beforeEach(inject(function($controller, $scope, $firebaseArray, $state, User, localStorage, done) {
    ctrl = $controller('firebaseCtrl');
    storage = localStorage;
    done();
  }));

  it('save a key-value pair to the local storage', function(done) { 
    var testObj = {};
    testObj =  {
      testKey : 'testValue',
    }

    storage.saveToLocalStorage(testObj, function(){
      storage.fetchFromLocalStorage(testObj.testKey, function(data){
        expect(data).toEqual('testValue');
        done();
      });
    });

  }); 
});