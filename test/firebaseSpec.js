var expect = chai.expect;


// describe('localStorage Factory', function() { 
//   beforeEach(module('chatApp'));

//   var ctrl, storage; 
  
//   beforeEach(inject(function($controller, $scope, $firebaseArray, $state, User, localStorage, done) {
//     ctrl = $controller('firebaseCtrl');
//     storage = localStorage;
//     done();
//   }));

//   it('save a key-value pair to the local storage', function(done) { 
//     var testObj = {};
//     testObj =  {
//       testKey : 'testValue',
//     }

//     storage.saveToLocalStorage(testObj, function(){
//       storage.fetchFromLocalStorage(testObj.testKey, function(data){
//         expect(data).toEqual('testValue');
//         done();
//       });
//     });

//   }); 
// });


describe('localStoage Factory', function () {

  var localStorage;
  beforeEach(module('chatApp'));
  beforeEach(inject(function (_localStorage_) {
    localStorage = _localStorage_;
  }));

  describe('Constructor', function () {

    it('has the saveToLocalStorage property', function () {

      console.log(localStorage);
      expect(new localStorage()).to.have.property('saveToLocalStorage');
    });

  });

});

