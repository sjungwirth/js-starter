const gulp = require('gulp');
const gutil = require('gulp-util');
const sass = require('gulp-sass');
const purify = require('gulp-purifycss');

const browserify = require('browserify');
const exorcist = require('exorcist');

const babelify = require('babelify');
const watchify = require('watchify');
const path = require('path');
const fs = require('fs');

gulp.task('css:watch', () => {
  gulp.watch(['./public/css/**/*.scss', './app/**/*.js'], ['css']);
});

gulp.task('css', () => {
  return gulp.src('./public/css/index.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(purify(['./app/**/*.js', './public/**/*.html']))
    .pipe(gulp.dest('./public/build/'));
});

function jsOutputStream() {
  return fs.createWriteStream(path.join(__dirname, 'public/build/index.js'), 'utf8');
}

gulp.task('js:watch', (done) => {
  const b = browserify({
    entries: ['./app/index.js'],
    cache: {},
    packageCache: {},
  });
  b.plugin(watchify);

  function bundle() {
    b.bundle().pipe(jsOutputStream());
  }

  b.on('time', (mills) => {
    gutil.log(`Finished '${gutil.colors.cyan('js')}' after`,
      gutil.colors.magenta(`${mills} ms`));
  });
  b.on('error', function handleError(err) {
    gutil.log(`js-error: ${JSON.stringify(err)}`);
    // end this stream
    this.emit('end');
  });
  b.on('update', () => {
    gutil.log(`Starting '${gutil.colors.cyan('js')}'...`);
    bundle();
  });
  bundle();
});

gulp.task('js', () => {
  const mapfile = path.join(__dirname, 'public/build/index.js.map');

  return browserify({ debug: true, entries: './app/index' })
    .transform(babelify, { presets: ['es2015'], global: true, compact: false })
    .transform('uglifyify', {
      global: true,
    })
    .bundle()
    .pipe(exorcist(mapfile))
    .pipe(jsOutputStream());
});
