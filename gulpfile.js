// --------------------------------------------------------------------------
// Require Modules
// --------------------------------------------------------------------------
const gulp = require("gulp");
const sass = require("gulp-sass");
const autoprefixer = require("autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
//const cssnano = require('cssnano');  // use only if css minification is needed
const postcss = require("gulp-postcss");
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const plumber = require("gulp-plumber");
const path = require("path");
const data = require("gulp-data");
const twig = require("gulp-twig");
const fs = require("graceful-fs");
const beautify = require("gulp-beautify");
const browserSync = require("browser-sync").create();

// --------------------------------------------------------------------------
// Compile Twig Files
// --------------------------------------------------------------------------
function compileTwig() {
  return (
    gulp
      .src(["./src/twig/templates/*.twig"])
      // Stay live and reload on error
      .pipe(
        plumber({
          handleError: function (err) {
            console.log(err);
            this.emit("end");
          },
        })
      )
      // Load template pages json data
      .pipe(
        data(function (file) {
          return JSON.parse(
            fs.readFileSync(
              "./src/twig/data/" + path.basename(file.path) + ".json"
            )
          );
        })
      )
      .pipe(twig())
      .on("error", function (err) {
        process.stderr.write(err.message + "\n");
        this.emit("end");
      })
      .pipe(beautify.html({ indent_size: 2 }))
      .pipe(gulp.dest("dist"))
  );
}

// --------------------------------------------------------------------------
// Compile SCSS into CSS
// --------------------------------------------------------------------------
function style() {
  return gulp
    .src("src/scss/**/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(sourcemaps.init())
    .pipe(postcss([autoprefixer() /*cssnano()*/])) // cssnano disabled. Uncomment this and the require on top to minify css
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist/css"))
    .pipe(browserSync.stream());
}

// --------------------------------------------------------------------------
// Bundle JS Files
// --------------------------------------------------------------------------
function bundlejs() {
  return gulp
    .src("src/js/**/*.js")
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat("bundle.js"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist/js/"))
    .pipe(browserSync.stream());
}

// --------------------------------------------------------------------------
// Watch files for modification and Reload Browser
// --------------------------------------------------------------------------
function watch() {
  browserSync.init({
    server: {
      baseDir: "./dist",
      index: "/index.html",
    },
  });
  gulp.watch("src/scss/**/*.scss", style);
  gulp.watch("dist/*.html").on("change", browserSync.reload);
  gulp.watch("src/js/**/*.js").on("change", bundlejs);
  gulp.watch(
    ["src/twig/templates/**/*.twig", "src/twig/data/*.twig.json"],
    compileTwig
  );
}
exports.style = style;
exports.bundlejs = bundlejs;
exports.compileTwig = compileTwig;
exports.watch = watch;
