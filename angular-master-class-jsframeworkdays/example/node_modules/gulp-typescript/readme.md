# [gulp](http://gulpjs.com)-typescript [![Build Status](https://travis-ci.org/sindresorhus/gulp-typescript.svg?branch=master)](https://travis-ci.org/sindresorhus/gulp-typescript)

> Compile TypeScript

*Issues with the output should be reported on the TypeScript [issue tracker](http://typescript.codeplex.com/workitem/list/basic).*


## Install

```bash
$ npm install --save-dev gulp-typescript
```


## Usage

```js
var gulp = require('gulp');
var typescript = require('gulp-typescript');

gulp.task('default', function () {
	return gulp.src('app.ts')
		.pipe(typescript())
		.pipe(gulp.dest('dist'));
});
```


## License

[MIT](http://opensource.org/licenses/MIT) © [Sindre Sorhus](http://sindresorhus.com)
