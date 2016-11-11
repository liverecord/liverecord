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
var fs = require('fs');
var runSequence = require('run-sequence');
var replace = require('gulp-replace-task');

var currentDeployId = 0;

var paths = {
    scripts: [
        'node_modules/angular/angular.js',
        'node_modules/angular-route/angular-route.js',
        'node_modules/socket.io/node_modules/socket.io-client/socket.io.js',
        'client/js/**.js'
    ],
    bootstrap: [

    ],
    images: 'client/images/**/*',
    css: [
        './client/styles/**.styl',
        './client/styles/**.css'

    ],
    fonts: [
        'src/view/components/font-awesome/fonts/**/*',
    ]
};

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use all packages available on npm
gulp.task('clean-js', function(cb) {
    // You can use multiple globbing patterns as you would with `gulp.src`
    del(['server/public/dist/j/*.js'], cb);
});

gulp.task('clean-mycss', function(cb) {
    del(['server/public/dist/c/*.css'], cb);
});

gulp.task('clean-img', function(cb) {
    del(['server/public/dist/i/*.*'], cb);
});

gulp.task('clean-fonts', function(cb) {
    del(['server/public/dist/fonts/*.*'], cb);
});

gulp.task('scripts-dev', function() {
    // Minify and copy all JavaScript (except vendor scripts)
    var filter = Filter('**/*.coffee');
    // with sourcemaps all the way down
    return gulp.src(paths.scripts)
        .pipe(concat('main.' + currentDeployId + '.js'))
        .pipe(gulp.dest('server/public/dist/j'));
});

gulp.task('scripts', function() {
    // Minify and copy all JavaScript (except vendor scripts)
    var filter = Filter('**/*.coffee');
    // with sourcemaps all the way down
    return gulp.src(paths.scripts)
        .pipe(sourcemaps.init())
        .pipe(ngAnnotate())
        .pipe(uglify({mangle: false}))
        .pipe(concat('main.' + currentDeployId + '.js'))
        .pipe(sourcemaps.write('server/public/dist/sm'))
        .pipe(gulp.dest('server/public/dist/j'));
});

// Copy all static images
gulp.task('images', function() {
    return gulp.src(paths.images)
    // Pass in options to the task
        .pipe(imagemin({optimizationLevel: 7, progressive: true}))
        .pipe(gulp.dest('server/public/dist/i'));
});

gulp.task('currentDeployInit', function (){
    currentDeployId = +new Date();
    currentDeployId = 1;
});
gulp.task('currentDeployWrite', function (){
    fs.writeFileSync('server/public/version.txt', currentDeployId);
});


gulp.task('css', function () {

    var filter = Filter('**/*.styl');

    return gulp.src(paths.css)
        .pipe(filter)
        .pipe(stylus())
        .pipe(replace({
            patterns: [
                {
                    match: '?v=4.4.0',
                    replacement: ''
                }
            ]
        }))
        .pipe(concat('main.' + currentDeployId + '.css'))
        .pipe(cleanCSS({compatibility: 'ie8',keepBreaks:true}))
        .pipe(gulp.dest('server/public/dist/c'));
});

gulp.task('fonts', function () {
    return gulp.src(paths.fonts)
        .pipe(gulp.dest('server/public/dist/fonts'));
});


// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['clean-js', 'scripts-dev']);
    gulp.watch(paths.images, ['clean-img', 'images']);
    gulp.watch(paths.css, ['clean-mycss', 'css']);
    gulp.watch(paths.fonts, ['clean-fonts', 'fonts']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'currentDeployInit', 'scripts', 'images', 'css', 'fonts', 'currentDeployWrite']);

gulp.task('build', function(callback) {
    runSequence('currentDeployInit',
        ['css', 'scripts', 'images', 'fonts'],
        'currentDeployWrite',
        callback);
});


