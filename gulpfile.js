
'use strict';

/********************
 *
 * Dependencies
 *
 ********************/

// Gulp Dependencies
var gulp       = require('gulp');
var rename     = require('gulp-rename');
var gutil      = require('gulp-util');
var sourceMaps = require('gulp-sourcemaps');
var source     = require('vinyl-source-stream');

// Build Dependencies
var browserify = require('browserify');
var watchify   = require('watchify');
var uglify     = require('gulp-uglify');
var buffer     = require('vinyl-buffer');
var liveReload = require('gulp-livereload');

// Development Dependencies
var jshint     = require('gulp-jshint');

// Test Dependencies
var mochaPhantomJs = require('gulp-mocha-phantomjs');



/********************
 *
 * Paths & files
 *
 ********************/

var allSrcFiles    = './src/*.js';
var allTestFiles   = ['./test/*.js', '!./test/index.js'];

var testFolder  = './test/';
var distFolder  = './dist/';

var testFile    = 'index.js';
var distFile    = 'type.js';

var distMin     = 'type.min.js';



/********************
 *
 * Tasks
 *
 ********************/

// Bundlers

var sourceBundler = watchify(browserify('./src/type.js', watchify.args));
sourceBundler.transform('brfs');

var testBundler = watchify(browserify('./test/type.js', watchify.args));
testBundler.transform('brfs');


// Todo jscs


// Lint

gulp.task('lint-source', function() {
  return gulp
    .src(allSrcFiles)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('lint-test', function() {
  return gulp
    .src(allTestFiles)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});


// Browserify

gulp.task('browserify-source', ['lint-source'], function() {
  return sourceBundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source(distFile))
    .pipe(buffer())
    .pipe(sourceMaps.init({loadMaps: true}))
    .pipe(sourceMaps.write('./'))
    .pipe(gulp.dest(distFolder));
});

gulp.task('browserify-test', ['lint-test'], function() {
  return testBundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source(testFile))
    .pipe(gulp.dest(testFolder));
});


// Build

gulp.task('uglify', ['browserify-source'], function() {
   return gulp
     .src(distFolder+distFile)
    .pipe(uglify())
    .pipe(rename(distMin))
    .pipe(gulp.dest(distFolder));
});


// Test

gulp.task('test', ['lint-test', 'browserify-test'], function() {
  return gulp
    .src('test/index.html')
    .pipe(mochaPhantomJs()); //.pipe(mochaPhantomJs({reporter:'nyan'}));
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.js', ['browserify-source', 'test']);
  gulp.watch('test/**/*.js', ['test']);
});


// Dev

gulp.task('dev', function() {
  return sourceBundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source(distFile))
    .pipe(buffer())
    .pipe(sourceMaps.init({loadMaps: true}))
    .pipe(sourceMaps.write('./'))
    .pipe(gulp.dest(distFolder))
    .pipe(liveReload({start: true}));
});


// High level tasks

gulp.task('build', ['uglify']);
gulp.task('default', ['test', 'build', 'watch']);