'use strict';

var gulp       = require('gulp');
var gutil      = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source     = require('vinyl-source-stream');
var streamify  = require('gulp-streamify')
var buffer     = require('vinyl-buffer');
var watchify   = require('watchify');
var browserify = require('browserify');
var livereload = require('gulp-livereload');
var rename     = require('gulp-rename');
var uglify     = require('gulp-uglify');

var bundler = watchify(browserify('./src/type.js', watchify.args));
bundler.transform('brfs');

var fileName = 'type.js';
var minName = 'type.min.js';
var dist = './dist';

/**
 *
 * @returns {*}
 */
function bundle() {
  return bundler.bundle()
    .pipe(source(fileName))
    .pipe(gulp.dest(dist));
}

/**
 *
 * @returns {*}
 */
function bundleMin() {
  return bundler.bundle()
    .pipe(source(minName))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest(dist));
}

/**
 * Will bundle type quickly using watchify and sets up live reload
 * @returns {*}
 */
function bundleDev() {
  return bundler.bundle()

    // Output errors handling
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))

    // File name
    .pipe(source(fileName))

    // Write source maps
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))

    // Write file
    .pipe(gulp.dest(dist))

    // Allow live reloading
    .pipe(livereload({start: true}));
}



bundler.on('update', bundleDev);

gulp.task('bundle', bundle);
gulp.task('minify', bundleMin);

gulp.task('build', ['bundle', 'minify']);

gulp.task('default', ['build']);