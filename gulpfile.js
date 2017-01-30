/**
 * Created by zoonman on 11/6/16.
 */
var gulp = require('gulp');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var cleanCSS = require('gulp-clean-css');
var stylus = require('gulp-stylus');
var Filter = require('gulp-filter');
var ngAnnotate = require('gulp-ng-annotate');

var autoprefixer = require('autoprefixer');
var postcss = require('gulp-postcss');

var fs = require('fs');
var runSequence = require('run-sequence');
var replace = require('gulp-replace-task');

var currentDeployId = 0;

var paths = {
  scripts: [
    'node_modules/angular/angular.js',
    'node_modules/angular-route/angular-route.js',
    'node_modules/angular-animate/angular-animate.js',
    //'node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js',
    'node_modules/socket.io-client/dist/socket.io.js',
    'node_modules/perfect-scrollbar/dist/js/perfect-scrollbar.js',
    'node_modules/angular-sanitize/angular-sanitize.js',
    'node_modules/ngstorage/ngStorage.js',
    'node_modules/fastclick/lib/fastclick.js',
    'node_modules/socketio-file-upload/client.js',
    'node_modules/angular-socialshare/dist/angular-socialshare.js',
    'node_modules/angular-growl-notifications/dist/angular-growl-notifications.js',
    'node_modules/angular-tooltips/dist/angular-tooltips.js',
    'client/js/**/*.js'
  ],
  bootstrap: [],
  images: 'client/images/**/*',
  css: [
    './client/styles/**.styl',
    './node_modules/perfect-scrollbar/dist/css/perfect-scrollbar.css',
    './node_modules/font-awesome/css/font-awesome.css',
    './client/styles/**.css'
  ],
  tpl: [
    'client/tpl/**/*'
  ],
  fonts: [
    'client/fonts/**/*',
    'node_modules/font-awesome/fonts/**/*'
  ],
  sounds: [
    'client/sounds/**/*',
  ]
};

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use all packages
// available on npm
gulp.task('clean-js', function(cb) {
      // You can use multiple globbing patterns as you would with `gulp.src`
      del(['server/public/dist/j/*.js'], cb);
    }
);

gulp.task('clean-mycss', function(cb) {
      del(['server/public/dist/c/*.css'], cb);
    }
);

gulp.task('clean-img', function(cb) {
      del(['server/public/dist/i/*.*'], cb);
    }
);

gulp.task('clean-fonts', function(cb) {
      del(['server/public/dist/fonts/*.*'], cb);
    }
);

gulp.task('clean-tpl', function(cb) {
      del(['server/public/dist/t/*.*'], cb);
    }
);

gulp.task('clean-sounds', function(cb) {
      del(['server/public/dist/s/*.*'], cb);
    }
);

gulp.task('scripts-dev', function() {
      // Minify and copy all JavaScript (except vendor scripts)
      var filter = Filter('**/*.coffee');
      // with sourcemaps all the way down
      return gulp.src(paths.scripts)
          .pipe(sourcemaps.init())
          .pipe(concat('main.' + currentDeployId + '.js'))
          .pipe(sourcemaps.write())
          .pipe(gulp.dest('server/public/dist/j'));
    }
);

gulp.task('scripts', function() {
      // Minify and copy all JavaScript (except vendor scripts)
      var filter = Filter('**/*.coffee');
      // with sourcemaps all the way down
      return gulp.src(paths.scripts)
          .pipe(sourcemaps.init())
          .pipe(ngAnnotate())
          .pipe(uglify({mangle: false}))
          .pipe(concat('main.' + currentDeployId + '.js'))
          .pipe(sourcemaps.write('./'))
          .pipe(gulp.dest('server/public/dist/j'));
    }
);

// Copy all static images
gulp.task('images', function() {
      return gulp.src(paths.images)
          // Pass in options to the task
          .pipe(imagemin({optimizationLevel: 7, progressive: true}))
          .pipe(gulp.dest('server/public/dist/i'));
    }
);

gulp.task('currentDeployInit', function() {
      currentDeployId = +new Date();
      currentDeployId = 1;
    }
);
gulp.task('currentDeployWrite', function() {
      fs.writeFileSync('server/public/version.txt', currentDeployId);
    }
);

gulp.task('css', function() {

      var filter = Filter('**/*.styl', {restore: true});

      return gulp.src(paths.css)
          .pipe(filter)
          .pipe(stylus())
          .pipe(filter.restore)
          .pipe(replace({
                patterns: [
                  {
                    match: '?v=4.7.0',
                    replacement: 'a'
                  }
                ]
              }
              )
          )
          .pipe(postcss([autoprefixer({browsers: ['last 10 versions']})]))
          .pipe(cleanCSS({compatibility: 'ie7', keepBreaks: true}))
          .pipe(concat('main.' + currentDeployId + '.css'))
          .pipe(gulp.dest('server/public/dist/c'));
    }
);

gulp.task('fonts', function() {
      return gulp.src(paths.fonts)
          .pipe(gulp.dest('server/public/dist/fonts'));
    }
);

gulp.task('tpl', function() {
      return gulp.src(paths.tpl)
          .pipe(gulp.dest('server/public/dist/t'));
    }
);

gulp.task('sounds', function() {
      return gulp.src(paths.sounds)
          .pipe(gulp.dest('server/public/dist/s'));
    }
);

// Rerun the task when a file changes
gulp.task('watch', function() {
      gulp.watch(paths.scripts, ['clean-js', 'scripts-dev']);
      gulp.watch(paths.images, ['clean-img', 'images']);
      gulp.watch(paths.css, ['clean-mycss', 'css']);
      gulp.watch(paths.tpl, ['clean-tpl', 'tpl']);
      gulp.watch(paths.fonts, ['clean-fonts', 'fonts']);
      gulp.watch(paths.sounds, ['clean-sounds', 'sounds']);
    }
);

// The default task (called when you run `gulp` from cli)
gulp.task('default',
    ['watch',
      'currentDeployInit',
      'scripts',
      'tpl',
      'images',
      'css',
      'fonts',
      'sounds',
      'currentDeployWrite'
    ]
);

gulp.task('build', function(callback) {
      runSequence('currentDeployInit',
          ['css', 'scripts', 'images', 'fonts', 'tpl'],
          'currentDeployWrite',
          callback
      );
    }
);


