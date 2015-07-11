var app = angular.module("music", ["firebase", 'ui.event'])
app.factory('playlist', function () {

  var Queue = function(collection){
    this.storage = [];
  }
  
  Queue.prototype.enqueue = function(song){
    this.storage.push(song);
  }

  Queue.prototype.dequeue = function(){
    return this.storage.shift();
  }

  Queue.prototype.ended = function (){
    this.dequeue();
  }

  return {
    Queue : Queue
  }

});


      