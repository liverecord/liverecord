/**
 * Created by zoonman on 11/6/16.
 */
const gulp = require('gulp');

const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

const uglifyes = require('uglify-es');
const composer = require('gulp-uglify/composer');
const minify = composer(uglifyes, console);

const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const chalk = require('chalk');
const stylus = require('gulp-stylus');
const Filter = require('gulp-filter');
const ngAnnotate = require('gulp-ng-annotate');
const embedTemplates = require('gulp-angular-embed-templates');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const pump = require('pump');

const fs = require('fs');

const replace = require('gulp-replace-task');
const plumber = require('gulp-plumber');

let currentDeployId = 0;

let paths = {
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
    'node_modules/angular-messages/angular-messages.js',
    'node_modules/messageformat/messageformat.js',
    'node_modules/angular-translate/dist/angular-translate.js',
    'node_modules/angular-translate/dist/angular-translate-interpolation-messageformat/angular-translate-interpolation-messageformat.js',
    'node_modules/angular-translate/dist/angular-translate-handler-log/angular-translate-handler-log.js',
    'node_modules/angular-translate/dist/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
    'node_modules/angular-translate/dist/angular-translate-loader-url/angular-translate-loader-url.js',
    'node_modules/angular-dynamic-locale/dist/tmhDynamicLocale.js',
    // 'node_modules/dompurify/src/purify.js',
    'node_modules/dompurify/dist/purify.js',
    'client/js/app.js',
    'client/js/shared/**/*.js',
    'client/js/components/**/*.js',
  ],
  bootstrap: [],
  images: 'client/images/**/*',
  css: [
    './client/styles/index.styl',
    './node_modules/perfect-scrollbar/dist/css/perfect-scrollbar.css',
    './node_modules/font-awesome/css/font-awesome.css',
    './node_modules/angular-tooltips/dist/angular-tooltips.css',
    './client/styles/**.css',
  ],
  tpl: [
    'client/tpl/**/*',
  ],
  fonts: [
    'client/fonts/**/*',
    'node_modules/font-awesome/fonts/**/*',
  ],
  sounds: [
    'client/sounds/**/*',
  ],
  locales: [
    'node_modules/angular-i18n/**/*',
    'client/locales/**/*',
  ],
};

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use all packages
// available on npm
gulp.task('clean-js', function(cb) {
      // You can use multiple globbing patterns as you would with `gulp.src`
      return del(['server/public/dist/j/*.js'], cb);
    },
);

gulp.task('clean-mycss', function(cb) {
      return del(['server/public/dist/c/*.css'], cb);
    },
);

gulp.task('clean-img', function(cb) {
      del(['server/public/dist/i/*.*'], cb);
    },
);

gulp.task('clean-fonts', function(cb) {
      del(['server/public/dist/fonts/*.*'], cb);
    },
);

gulp.task('clean-tpl', function(cb) {
      del(['server/public/dist/t/*.*'], cb);
    },
);

gulp.task('clean-sounds', function(cb) {
      del(['server/public/dist/s/*.*'], cb);
    },
);

gulp.task('clean-locales', function(cb) {
      del(['server/public/dist/l/*.*'], cb);
    },
);

gulp.task('scripts-dev', function() {
      // Minify and copy all JavaScript (except vendor scripts)
      let filter = Filter('**/*.coffee');
      // with sourcemaps all the way down
      return gulp.src(paths.scripts).
          pipe(sourcemaps.init()).
          pipe(embedTemplates({skipTemplates: /\.html/})).
          pipe(ngAnnotate()).
          pipe(concat('main.' + currentDeployId + '.js')).
          pipe(sourcemaps.write('./')).
          pipe(gulp.dest('server/public/dist/j'));
    },
);

gulp.task('scripts', function(cb) {

      // Minify and copy all JavaScript (except vendor scripts)
      let filter = Filter('**/*.coffee');

      pump([
        gulp.src(paths.scripts),
        plumber(),
        sourcemaps.init(),
        embedTemplates({skipTemplates: /\.html/}),
        ngAnnotate(),
        minify({mangle: false, ie8: false}),
        concat('main.' + currentDeployId + '.js'),
        sourcemaps.write('./'),
        gulp.dest('server/public/dist/j'),
      ], cb);
    },
);

// Copy all static images
gulp.task('images', function() {
      return gulp.src(paths.images)
          // Pass in options to the task
          .pipe(imagemin({optimizationLevel: 7, progressive: true})).
          pipe(gulp.dest('server/public/dist/i'));
    },
);

gulp.task('currentDeployInit', function(cb) {
      currentDeployId = +new Date();
      //currentDeployId = 1;
      cb();
    },
);
gulp.task('currentDeployWrite', (cb) => {
      fs.writeFile('server/public/version.txt', currentDeployId, null, cb);
    },
);

gulp.task('css', function() {

      let filter = Filter('**/*.styl', {restore: true});
      return gulp.src(paths.css).
          pipe(filter).
          pipe(plumber()).
          pipe(sourcemaps.init()).
          pipe(stylus()).
          pipe(filter.restore).
          pipe(replace({
                patterns: [
                  {
                    match: '?v=4.7.0',
                    replacement: 'a',
                  },
                ],
              },
              ),
          ).
          pipe(postcss([autoprefixer({browsers: ['last 10 versions']})]))
          //.pipe(cleanCSS({compatibility: 'ie7', keepBreaks: true}))
          .pipe(concat('main.' + currentDeployId + '.css')).
          pipe(sourcemaps.write('.')).
          pipe(gulp.dest('./server/public/dist/c'));
    },
);

gulp.task('fonts', function() {
      return gulp.src(paths.fonts).pipe(gulp.dest('server/public/dist/fonts'));
    },
);

gulp.task('tpl', function() {
      return gulp.src(paths.tpl).pipe(gulp.dest('server/public/dist/t'));
    },
);

gulp.task('sounds', function() {
      return gulp.src(paths.sounds).pipe(gulp.dest('server/public/dist/s'));
    },
);
gulp.task('locales', function() {
      return gulp.src(paths.locales).pipe(gulp.dest('server/public/dist/l'));
    },
);

gulp.task('rebuild-css',
    gulp.series(
        'css',
        'currentDeployWrite',
    ),
);

gulp.task(
    'rebuild-js',
    gulp.series('clean-js',
        'scripts-dev',
        'currentDeployWrite',
    ),
);

// Rerun the task when a file changes
// gulp.task('watch', function() {
//       gulp.run('build');
//       gulp.watch(paths.scripts, {interval: 1000}, 'rebuild-js');
//       gulp.watch(paths.images, {interval: 5000}, gulp.parallel('clean-img', 'images'));
//       gulp.watch(
//           [
//             './client/styles/*/**.*',
//             './client/styles/themes/*.*'
//           ].concat(paths.css),
//           {interval: 1000},
//           ['rebuild-css']
//       );
//       gulp.watch(paths.tpl, {interval: 1000}, ['clean-tpl', 'tpl', 'scripts-dev']);
//       gulp.watch(paths.fonts, {interval: 5000}, ['clean-fonts', 'fonts']);
//       gulp.watch(paths.sounds, {interval: 5000}, ['clean-sounds', 'sounds']);
//       gulp.watch(paths.locales, {interval: 1000}, ['clean-locales', 'locales']);
//     }
// );

gulp.task('buildInformer', function(callback) {
  'use strict';
  console.log(
      'Use ' + chalk.green.bold('gulp watch') +
      ' to watch & compile your files on the fly',
  );
  callback();
});

// The default task (called when you run `gulp` from cli)

gulp.task('build',
    gulp.series(
        'currentDeployInit',
        gulp.parallel('scripts', 'locales', 'tpl', 'css', 'images', 'fonts',
            'sounds'),
        'currentDeployWrite',
    ),
);

gulp.task(
    'default',
    gulp.series('build', 'buildInformer'),
);
