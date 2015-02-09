
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
var sourcemaps = require('gulp-sourcemaps');
var source     = require('vinyl-source-stream');

// Build Dependencies
var browserify = require('gulp-browserify');
var watchify   = require('watchify');
var uglify     = require('gulp-uglify');
var livereload = require('gulp-livereload');

// Development Dependencies
var jshint     = require('gulp-jshint');

// Test Dependencies
var mochaPhantomjs = require('gulp-mocha-phantomjs');



/********************
 *
 * Paths & files
 *
 ********************/

var srcFiles    = './src/*.js';
var testFiles   = './test/*.js';
var testFolder  = './test/';
var bundledTest = './test/index.js';
var distFile    = 'type.js';
var distMin     = 'type.min.js';
var distFolder  = './dist/';

var bundler = watchify(browserify('./src/type.js', watchify.args));
bundler.transform('brfs');



/********************
 *
 * Tasks
 *
 ********************/

// Lint

gulp.task('lint-source', function() {
  return gulp.src(srcFiles)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('lint-test', function() {
  return gulp.src(testFiles)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});


// Browserify

gulp.task('browserify-source', ['lint-source'], function() {
  return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source(distFile))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(distFolder));
});

gulp.task('browserify-test', ['lint-test'], function() {
  return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source(bundledTest))
    .pipe(gulp.dest(testFolder));
});


// Build

gulp.task('uglify', ['browserify-source'], function() {
   return gulp.src(distFolder+distFile)
    .pipe(uglify())
    .pipe(rename(distMin))
    .pipe(gulp.dest(distFolder));
});


// Test

gulp.task('test', ['lint-test', 'browserify-test'], function() {
  return gulp.src('test/index.html')
    .pipe(mochaPhantomjs());
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.js', ['browserify-source', 'test']);
  gulp.watch('test/**/*.js', ['test']);
});


// Dev

gulp.task('dev', function() {
  return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source(distFile))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(distFolder))
    .pipe(livereload({start: true}));
});


// Tasks

gulp.task('build', ['uglify']);
gulp.task('default', ['test', 'build', 'watch']);