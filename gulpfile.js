'use strict';

// Todo https://blog.engineyard.com/2015/client-side-javascript-project-gulp-and-browserify

// Gulp Dependencies
var gulp       = require('gulp');
var gutil      = require('gulp-util');

// Build Dependencies
var sourcemaps = require('gulp-sourcemaps');
var source     = require('vinyl-source-stream');
var streamify  = require('gulp-streamify');
var buffer     = require('vinyl-buffer');
var watchify   = require('watchify');
var browserify = require('browserify');
var livereload = require('gulp-livereload');
var uglify     = require('gulp-uglify');

// Development Dependencies
var jscs       = require('gulp-jscs');
var jshint     = require('gulp-jshint');
var notify     = require('gulp-notify');

// Test Dependencies
var mochaPhantomjs = require('gulp-mocha-phantomjs');

/**
 * Variables to reuse
 */
var srcFolder  = './src';
var srcFiles   = srcFolder+'/*.js';
var testFolder = './test';
var testFiles  = testFolder+'/*.js';
var fileName   = 'type.js';
var minName    = 'type.min.js';
var dist       = './dist';
var bundler    = watchify(browserify('./src/type.js', watchify.args));

bundler.transform('brfs');

/**
 * Will bundle the final type.js file
 */
function bundle() {
  return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source(fileName))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dist));
}

/**
 * Will bundle the minified type.js file
 */
function bundleMin() {
  return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source(minName))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest(dist));
}

/**
 * Will bundle type.js for Atom editor
 */
function bundleAtom() {
}

/**
 * Will bundle type quickly using watchify and sets up live reload
 */
function bundleDev() {
  return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source(fileName))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dist))
    .pipe(livereload({start: true}));
}

/**
 * Will run mocha tests
 */
function mocha() {
  return gulp.src('./test/index.html', {read: false})
    .pipe(mochaPhantomjs());
    //.pipe(mocha({reporter: 'nyan'}));
}

/**
 * Will run jshintrc
 */
function lint() {
  return gulp.src(srcFiles)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
}

/**
 * Will check the code style using jscs
 */
function checkJscs() {
  return gulp.src(srcFiles)
    .pipe(jscs());
}

/**
 * Will utter a desktop notification saying that
 * tests have run successfully
 */
function notifyTest() {
  return gulp.src('/')
    .pipe(notify({
      title: 'Tests',
      message: 'Tests successful'
    }));
}

/**
 * Will rebundle type.js when the sources change
 */
bundler.on('update', bundleDev);

/**
 * Atomic Gulp tasks
 */
gulp.task('bundle', bundle);
gulp.task('minify', bundleMin);
gulp.task('atom', bundleAtom);
gulp.task('mocha', mocha);
gulp.task('lint', lint);
gulp.task('jscs', checkJscs);

/**
 * Gulp Tasks for usage in the console
 */
gulp.task('dev', bundleDev);
gulp.task('test', ['mocha', 'lint', 'jscs'], notifyTest);
gulp.task('build', ['bundle', 'minify', 'atom']);
gulp.task('default', ['build']);

// Todo https://blog.engineyard.com/2015/client-side-javascript-project-gulp-and-browserify
