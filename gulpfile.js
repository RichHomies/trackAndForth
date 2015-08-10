var gulp      = require('gulp'),
    nodemon   = require('gulp-nodemon'),
    bs        = require('browser-sync'),
    reload    = bs.reload,
    when      = require('gulp-if'),
    shell     = require('gulp-shell');

var testFiles = [
"bower_components/angular/angular.min.js",
"bower_components/firebase/firebase.js",
"bower_components/angularfire/dist/angularfire.min.js",
"bower_components/angular-scroll-glue/src/scrollglue.js",
"bower_components/lodash/lodash.min.js",
"bower_components/angular-ui-event/dist/event.min.js",
"bower_components/angular-sanitize/angular-sanitize.min.js",
"bower_components/angular-ui-router/release/angular-ui-router.min.js",
"bower_components/moment/min/moment.min.js",
"js/jquery-1.7.1.min.js",
"js/soundCloudSDK.js",
"bower_components/angular-mocks/angular-mocks.js",
'js/app.js',
'test/firebaseSpec.js'
];

// any changes made to your
// client side code will automagically refresh your page
// with the new changes
gulp.task('start', ['serve'],function () {
  bs({
    notify: true,
    // address for server,
    injectChanges: true,
    files: paths.scripts.concat(paths.html, paths.styles),
    proxy: 'localhost:8000'
  });
});

gulp.task('karma', shell.task([
  'karma start'
]));

// start our node server using nodemon
gulp.task('serve', function() {
  nodemon({script: 'test/firebase.js', ignore: 'node_modules/**/*.js'});
});

gulp.task('default', ['start']);