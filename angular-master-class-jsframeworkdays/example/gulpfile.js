var gulp = require('gulp'),
  gutil = require('gulp-util'),
  concat = require('gulp-concat'),
  changed = require('gulp-changed'),
  connect = require('gulp-connect'),
  clean = require('gulp-clean'),
  karma = require('gulp-karma'),
  typescript = require('gulp-typescript'),

  env = process.env.NODE_ENV || 'dev';

gulp.task('scripts.app', function () {
  var configFile = 'app/config/config.' + env + '.js';
  return gulp.src(['app/app.js', configFile, '!app/config', 'app/**/*.ts', 'app/**/*.js'])
    .pipe(typescript())
    .pipe(concat('app.js'))
    .pipe(gulp.dest('public/js/'))
    .pipe(connect.reload());
});

gulp.task('scripts.vendor', function () {
  var source = [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/angular/angular.js',
    'bower_components/lodash/dist/lodash.js',
    'bower_components/angular-ui-router/release/angular-ui-router.js',
    'bower_components/restangular/dist/restangular.js',
    'bower_components/ngstorage/ngStorage.js'
  ];

  return gulp.src(source)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('public/js/'))
    .pipe(connect.reload());
});

gulp.task('styles', function () {
  var source = ['bower_components/pure/pure.css',
    'app/assets/styles.css'
  ];

  return gulp.src(source)
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('./public/css'))
    .pipe(connect.reload())
});

gulp.task('templates.direct', function () {
  return gulp.src('app/**/*.html')
    .pipe(changed('public'))
    .pipe(gulp.dest('public'))
    .pipe(connect.reload());
});

gulp.task('server', function () {
  connect.server({
    root: 'public',
    port: 9090,
    livereload: true
  });
});

gulp.task('karma.watch', function () {
  return gulp.src('app/**/*.test.js')
    .pipe(karma({
      configFile: 'karma.config.js',
      action: 'watch'
    }));
});

gulp.task('clean', function () {
  gulp.src('public/**', {read: false})
    .pipe(clean());
});

gulp.task('watch', ['clean'], function () {
  gulp.watch('app/**/*.js', ['scripts.app']);
  gulp.watch('app/assets/*.css', ['styles']);
  gulp.watch('app/**/*.html', ['templates.direct']);
});

gulp.task('default', ['clean'], function () {
  gulp.start('scripts.app', 'scripts.vendor', 'styles', 'templates.direct', 'server', 'watch', 'karma.watch');
});

gulp.task('build', ['clean'], function () {
  gulp.start('scripts.app', 'scripts.vendor', 'styles', 'templates.direct');
});