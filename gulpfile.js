'use strict';

/********************
 *
 * Dependencies
 *
 ********************/

// Basic Dependencies
var fs   = require('fs');
var gulp = require("gulp");
var _    = require('lodash');

// Build Dependencies
var rjs      = require('requirejs');
var amdclean = require('amdclean');
var rename   = require('gulp-rename');
var uglify   = require("gulp-uglify");

// Development Dependencies
var jscs       = require("gulp-jscs");
var jslint     = require("gulp-jslint");
var livereload = require("gulp-livereload");
var notify     = require("gulp-notify");

// Test Dependencies
var mochaPhantomJs = require("gulp-mocha-phantomjs");

/********************
 *
 * Paths & files
 *
 ********************/

// Tests
var testFolder   = "./test/";
var allTestFiles = ['./test/**/*.js', '!./test/index.js'];
var distTestFile = "index.js";

// Sources
var allSrcFiles = ['./src/**/*.js'];

// Dist
var distFolder = "./dist/";
var distFile   = "type.js";
var distMin    = "type.min.js";

/********************
 *
 * Configs
 * Todo https://github.com/yahoo/gifshot/blob/master/gulpfile.js
 *
 ********************/

var configs = {
  'rjs': {
    'findNestedDependencies': true,
    'preserveLicenseComments': false,
    'optimize': 'none',
    'skipModuleInsertion': true,
    'cjsTranslate': true
  }
};

/********************
 *
 * Code Quality
 *
 ********************/

// Code style
//gulp.task("jscs-source", function () {
//  return gulp
//    .src(allSrcFiles)
//    .pipe(jscs());
//});

//gulp.task("jscs-test", function () {
//  return gulp
//    .src(allTestFiles)
//    .pipe(jscs());
//});

// Lint
//gulp.task("lint-source", function () {
//  return gulp
//    .src(allSrcFiles)
//    .pipe(jshint(".jshintrc"))
//    .pipe(jshint.reporter("jshint-stylish"))
//    .pipe(jshint.reporter("fail"));
//});

//gulp.task("lint-test", function () {
//  return gulp
//    .src(allTestFiles)
//    .pipe(jshint(".jshintrc"))
//    .pipe(jshint.reporter("jshint-stylish"))
//    .pipe(jshint.reporter("fail"));
//});

/********************
 *
 * Build
 *
 ********************/

gulp.task('concat-src', function (callback) {

  var outputFile = distFolder + distFile,
    rjsOptions = _.merge(_.clone(configs.rjs), {
      'baseUrl': './src/',
      'include': ['type'],
      'out': outputFile
    });

  rjs.optimize(rjsOptions, function() {
    var amdcleanOptions = {
      'transformAMDChecks': false,
      'filePath': outputFile
    };
    fs.writeFileSync(outputFile, amdclean.clean(amdcleanOptions));
    gulp
      .src(allSrcFiles)
      .pipe(livereload());
    callback();
  }, function (err) {
    return callback(err);
  });

});


gulp.task("uglify", ["concat-src"], function () {
  return gulp
    .src(distFolder + distFile)
    .pipe(uglify())
    .pipe(rename(distMin))
    .pipe(gulp.dest(distFolder));
});

/********************
 *
 * Tests
 *
 ********************/

gulp.task('concat-test', function (callback) {

  var outputFile = testFolder + distTestFile,
    rjsOptions = _.merge(_.clone(configs.rjs), {
      'baseUrl': testFolder,
      'include': ['type'],
      'out': outputFile
    });

  rjs.optimize(rjsOptions, function () {
    gulp
      .src(allTestFiles)
      .pipe(livereload());
    callback();
  }, function (err) {
    return callback(err);
  });

});

gulp.task("test", ["concat-test"], function () {
  return gulp
    .src('test/index.html')
    .pipe(mochaPhantomJs());//.pipe(mochaPhantomJs({reporter:'nyan'}));
});

/********************
 *
 * Development
 *
 ********************/

gulp.task('dev', ["concat-src"], function () {
  var allFiles = allSrcFiles.concat(allTestFiles);
  livereload.listen();
  gulp.watch(allFiles, ["test", "build"]);
});

/********************
 *
 * High level tasks
 * Intended for usage in console
 *
 ********************/
gulp.task("build", ["concat-src"]);
gulp.task("dist", ["test", "build", "uglify"]);
gulp.task("default", ["test", "build"]);
