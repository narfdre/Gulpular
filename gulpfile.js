var gulp            = require('gulp');
var ngAnnotate      = require('gulp-ng-annotate');
var uglify          = require('gulp-uglify');
var rename          = require('gulp-rename');
var bower           = require('gulp-bower');
var concat          = require('gulp-concat');
var less            = require('gulp-less');
var templateCache   = require('gulp-angular-templatecache');
var flatten         = require('gulp-flatten');
var minifyHtml      = require('gulp-minify-html');
var minifyCss       = require('gulp-minify-css');
var config          = require('./gulp-config.json');

gulp.task('scripts', function() {
  gulp.src('src/scripts/**/*.js')
  .pipe(ngAnnotate())
  .pipe(concat('all.js'))
  .pipe(gulp.dest('public/scripts'))
  .pipe(rename('all.min.js'))
  .pipe(uglify({ outSourceMaps: true }))
  .pipe(gulp.dest('public/scripts'));
});

//gulp-copy
gulp.task('copy', function(){

  //Move Javascript Libraries
//	WARNING: uglify on the libs takes _FOREVER_
  gulp.src(config.libs)
    .pipe(concat('libs.js'))
    .pipe(gulp.dest('public/scripts'))
    .pipe(rename('libs.min.js'))
    .pipe(uglify({outSourceMaps: true }))
    .pipe(gulp.dest('public/scripts'));

  //TODO: not sure we need this now
  gulp.src("bower_components/**/*.js.map")
    .pipe(flatten())
    .pipe(gulp.dest('public/scripts'));

  gulp.src(config.libsCss)
    .pipe(concat('libs.css'))
    .pipe(gulp.dest('public/css'))
    .pipe(rename('libs.min.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest('public/css'));

  //Move fonts
  gulp.src('bower_components/font-awesome-bower/fonts/*')
    .pipe(gulp.dest('public/fonts'));

  //move img
  gulp.src('src/img/*')
    .pipe(gulp.dest('public/css'));
});

//gulp-less
gulp.task('less', function () {
  gulp.src('src/less/app.less')
    .pipe(less())
    .pipe(gulp.dest('public/css'))
    .pipe(rename('app.min.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest('public/css'));
});

//gulp-html2js
gulp.task('html2js', function(){
  gulp.src('src/scripts/**/*.tpl.html')
    .pipe(minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe(templateCache({
      root: '/tpl/',
      module: 'MyApp'
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('public/templates'))
    .pipe(rename('templates.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public/templates'));
});

gulp.task('prepare', function() {
    bower();
});

gulp.task('dev', ['scripts', 'html2js', 'copy', 'less'], function(){
  gulp.watch('src/scripts/**/*.js', ['scripts']);
  gulp.watch('src/scripts/**/*.tpl.html', ['html2js']);
  gulp.watch('src/less/**', ['less']);
});

gulp.task('build', ['scripts', 'html2js', 'copy', 'less']);
