'use strict';

/********************
 *
 * Dependencies
 *
 ********************/

var gulp, rename, gutil, sourceMaps, source,
  uglify, buffer, liveReload, amdclean,
  jscs, jshint, notify;


// Gulp Dependencies
gulp = require("gulp");
rename = require("gulp-rename");
gutil = require("gulp-util");
sourceMaps = require("gulp-sourcemaps");
source = require("vinyl-source-stream");

// Build Dependencies
uglify     = require("gulp-uglify");
buffer     = require("vinyl-buffer");
liveReload = require("gulp-livereload");
amdclean   = require("gulp-amdclean");

// Development Dependencies
jscs       = require("gulp-jscs");
jshint     = require("gulp-jshint");
notify     = require("gulp-notify");

// Test Dependencies
var mochaPhantomJs = require("gulp-mocha-phantomjs");



/********************
 *
 * Paths & files
 *
 ********************/

var allSrcFiles  = "./src/*.js";
var allTestFiles = ["./test/*.js", "!./test/index.js"];
var testFolder   = "./test/";
var distFolder   = "./dist/";
var testFile     = "index.js";
var distFile     = "type.js";
var distMin      = "type.min.js";



/********************
 *
 * Tasks
 *
 ********************/


// Code style

gulp.task("jscs-source", function () {
  return gulp.src(allSrcFiles)
    .pipe(jscs());
});

gulp.task("jscs-test", function () {
  return gulp.src(allTestFiles)
    .pipe(jscs());
});


// Lint

gulp.task("lint-source", function () {
  return gulp
    .src(allSrcFiles)
    .pipe(jshint(".jshintrc"))
    .pipe(jshint.reporter("jshint-stylish"))
    .pipe(jshint.reporter("fail"));
});

gulp.task("lint-test", function () {
  return gulp
    .src(allTestFiles)
    .pipe(jshint(".jshintrc"))
    .pipe(jshint.reporter("jshint-stylish"))
    .pipe(jshint.reporter("fail"));
});


// Browserify

gulp.task("browserify-source", [/*"jscs-source", */"lint-source"], function () {
  return sourceBundler.bundle()
    .on("error", gutil.log.bind(gutil, "Browserify Error"))
    .pipe(source(distFile))
    .pipe(buffer())
    .pipe(sourceMaps.init({loadMaps: true}))
    .pipe(sourceMaps.write("./"))
    .pipe(gulp.dest(distFolder));
});

gulp.task("browserify-test", [/*"jscs-test", */"lint-test"], function () {
  return testBundler.bundle()
    .on("error", gutil.log.bind(gutil, "Browserify Error"))
    .pipe(source(testFile))
    .pipe(gulp.dest(testFolder));
});


// Build

gulp.task("uglify", ["browserify-source"], function () {
   return gulp
     .src(distFolder + distFile)
    .pipe(uglify())
    .pipe(rename(distMin))
    .pipe(gulp.dest(distFolder));
});


// Test

gulp.task("test", ["browserify-test"], function () {
  return gulp
    .src("test/index.html")
    .pipe(mochaPhantomJs()); //.pipe(mochaPhantomJs({reporter:"nyan"}));
});

gulp.task("watch-test", function () {
  gulp.watch(allTestFiles, ["test"]);
});


// Dev

function bundleDev() {
  return sourceBundler.bundle()
    .on("error", gutil.log.bind(gutil, "Browserify Error"))
    .pipe(source(distFile))
    .pipe(buffer())
    .pipe(sourceMaps.init({loadMaps: true}))
    .pipe(sourceMaps.write("./"))
    .pipe(gulp.dest(distFolder))
    .pipe(liveReload({start: true}));
}
gulp.task("dev", bundleDev);
sourceBundler.on("update", bundleDev);



// High level tasks

gulp.task("build", ["uglify"]);
gulp.task("default", ["test", "build"]);
