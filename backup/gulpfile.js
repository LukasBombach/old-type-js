'use strict';

/********************
 *
 * Dependencies
 *
 ********************/

// Node modules
var fs = require('fs');

// Gulp Dependencies
var gulp = require("gulp");
//var rename = require("gulp-rename");
//var gutil = require("gulp-util");
//var sourceMaps = require("gulp-sourcemaps");
//var source = require("vinyl-source-stream");

// Build Dependencies
var uglify     = require("gulp-uglify");
//var buffer     = require("vinyl-buffer");
//var amdclean   = require("gulp-amdclean");
//var rjs      = require("gulp-requirejs");
var amdclean   = require('amdclean');
var rjs        = require('requirejs');


// Development Dependencies
var jscs       = require("gulp-jscs");
var jshint     = require("gulp-jshint");
var liveReload = require("gulp-livereload");
var notify     = require("gulp-notify");

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
var distTestFile = "index.js";
var distFile     = "type.js";
var distMin      = "type.min.js";

/********************
 *
 * Tasks
 *
 ********************/

// Code style
gulp.task("jscs-source", function () {
  return gulp
    .src(allSrcFiles)
    .pipe(jscs());
});

gulp.task("jscs-test", function () {
  return gulp
    .src(allTestFiles)
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

// Build
// Todo https://github.com/yahoo/gifshot/blob/master/gulpfile.js//
gulp.task('concat', function (cb) {
  var outputFile = 'dist/type2.js',
    rjsOptions = {
      //'findNestedDependencies': true,
      'baseUrl': './src/',
      'preserveLicenseComments': false,
      'optimize': 'none',
      'skipModuleInsertion': true,
      'include': ['type'],
      'out': outputFile,
      'cjsTranslate': true
    };

  rjs.optimize(rjsOptions, function() {
    var amdcleanOptions = {
      'transformAMDChecks': false,
      'filePath': outputFile
    };

    fs.writeFileSync(outputFile, amdclean.clean(amdcleanOptions));
    cb(); // finished task
  }, function(err) {
    return cb(err); // return error
  });
});

gulp.task("build", function () {
  console.log('rjs-ing');

  return rjs({
    baseUrl: './src/',
    include: './src/',
    name: 'type',
    out: 'type-rjs.js',
    cjsTranslate: true
  }).pipe(gulp.dest(distFolder));


  //return gulp
  //  .src(['./src/type.js'])
  //  //.pipe(source(distFile))
  //  .pipe(amdclean.gulp({
  //    'prefixMode': 'standard'
  //  }))
  //  .pipe(gulp.dest(distFolder));
});

gulp.task("uglify", ["build"], function () {
  return gulp
    .src(distFolder + distFile)
    .pipe(uglify())
    .pipe(rename(distMin))
    .pipe(gulp.dest(distFolder));
});

// Test

// Dev



// High level tasks

//gulp.task("build", ["uglify"]);
gulp.task("default", ["test", "build"]);
