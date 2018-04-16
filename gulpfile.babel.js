import gulp from 'gulp'
import rollup from "gulp-better-rollup"
import babel from "rollup-plugin-babel"
import rename from "gulp-rename"
import uglify from 'rollup-plugin-uglify'

gulp.task("dist", () => {
  return gulp.src("./src/Stage.js")
    .pipe(rollup({
      plugins: [
        babel({presets: [["env", { "modules": false }]], plugins: ["external-helpers"], babelrc: false}),
        uglify()
      ],
    },{ name: "EasyParallax", format: "umd" }))
    .pipe(rename("easy-parallax.js"))
    .pipe(gulp.dest("./dist/"))
})

gulp.task('watch', () => {
  return gulp.watch(['index.js', './src/**/*.js'], ['dist'])
})

gulp.task('default', ['dist', 'watch'])
