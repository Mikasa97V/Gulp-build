const { src, dest, series, watch, parallel } = require('gulp')
const concat = require('gulp-concat')
const htmlmin = require('gulp-htmlmin')
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const svgSprite = require('gulp-svg-sprite')
const image = require('gulp-image')
const uglify = require('gulp-uglify-es').default
const babel = require('gulp-babel')
const notify = require('gulp-notify')
const sourcemaps = require('gulp-sourcemaps')
const del = require('del')
const browserSync = require('browser-sync').create()

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const styles = () => {
  let task = src('src/styles/**/*.css')

  if (isDev) {
    task = task.pipe(sourcemaps.init())
  }

  task = task.pipe(concat('main.css'))
    .pipe(autoprefixer({
      cascade: false,
    }))

  if (isProd) {
    task = task.pipe(cleanCSS({
      level: 2,
    }))
  }

  if (isDev) {
    task = task.pipe(sourcemaps.write())
  }

  return task.pipe(dest('dist'))
    .pipe(browserSync.stream())
}

const htmlMinify = () => {
  let task = src('src/**/*.html')

  if (isProd) {
    task = task.pipe(htmlmin({
      collapseWhitespace: true,
    }))
  }

  return task.pipe(dest('dist'))
    .pipe(browserSync.stream())
}

const scripts = () => {
  let task = src([
      'src/scripts/components/**/*.js',
      'src/scripts/index.js'
    ])

  if (isDev) {
    task = task.pipe(sourcemaps.init())
  }

  task = task.pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(concat('app.js'))

  if (isProd) {
    task = task.pipe(uglify({
      toplevel: true,
    }).on('error', notify.onError()))
  }

  if (isDev) {
    task = task.pipe(sourcemaps.write())
  }

  return task.pipe(dest('dist'))
    .pipe(browserSync.stream())
}

const svgSprites = () => {
  return src('src/images/svg/**/*.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg'
        }
      }
    }))
    .pipe(dest('dist/images'))
}

const images = () => {
  return src([
    'src/images/**/*.jpg',
    'src/images/**/*.jpeg',
    'src/images/**/*.png',
    'src/images/*.svg',
  ])
  .pipe(image())
  .pipe(dest('dist/images'))
}

const resources = () => {
  return src('src/resources/**')
    .pipe(dest('dist/resources'))
}

const clean = () => {
  return del(['dist'])
}

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  })
  watch('src/**/*.html', htmlMinify)
  watch('src/styles/**/*.css', styles)
  watch('src/images/**', images)
  watch('src/scripts/**/*.js', scripts)
  watch('src/resources/**', resources)
}


exports.build = series(clean, parallel(htmlMinify, scripts, styles, images, svgSprites))
exports.dev = series(clean, resources, htmlMinify, scripts, styles, images, svgSprites, watchFiles)
