var gulp = require("gulp");
var uglify = require("gulp-uglify");
var jshint = require("gulp-jshint");
var stripDebug = require("gulp-strip-debug");

var src = ['src/**/*.js'];

gulp.task('build', function(){
	return gulp.src(src)
		.pipe(stripDebug())
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'))
		.pipe(uglify())
		.pipe(gulp.dest("dist/produccion/"));
});

gulp.task('dev', function(){
	return gulp.src(src)
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(gulp.dest("dist/desarrollo/"));
});

gulp.task('watch', function(){
	gulp.watch(src,['dev']);
});

gulp.task('default', ['dev','watch']);
