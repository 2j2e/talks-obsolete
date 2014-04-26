// Karma configuration
// Generated on Fri Mar 14 2014 14:58:02 GMT+0200 (EET)

module.exports = function (config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['jasmine'],

    preprocessors: {
      '**/*.html': ['ng-html2js']
    },

    // list of files / patterns to load in the browser
    files: [
      '../angular-mc/bower_components/angular/angular.js',
      '../angular-mc/bower_components/lodash/dist/lodash.js',
      '../angular-mc/bower_components/angular-ui-router/release/angular-ui-router.js',
      '../angular-mc/bower_components/restangular/dist/restangular.js',
      '../angular-mc/bower_components/angular-mocks/angular-mocks.js',
      '../angular-mc/bower_components/ngstorage/ngStorage.js',
      '../angular-mc/app/**/*.js',
      '../angular-mc/app/**/*.html',
      '../angular-mc/tests/**/*.js'
    ],


    // list of files to exclude
    exclude: [

    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress', 'html'],

    htmlReporter: {
      outputFile: 'tests/units.html'
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['Chrome'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
