var phantom = require('phantom');
var url = 'http://www.firebase.com';



phantom.create(function (ph) {
  ph.createPage(function (page) {
   page.set('viewportSize', {width:1200,height:1920});
   page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js', function() {
     page.open(url, function (status) {
      if(url) {
        page.evaluate(function () {
          return $('#nav-setup');
        }, function(response) {
          console.log(response);
        });
      }

    });

   });

 });
}, {
  dnodeOpts: {
    weak: false
  }
});


