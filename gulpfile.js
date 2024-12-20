// node.js Packages / Dependencies
const gulp          = require('gulp');
const sass          = require('gulp-sass')(require('sass'));
const uglify        = require('gulp-uglify');
const rename        = require('gulp-rename');
const concat        = require('gulp-concat');
const cleanCSS      = require('gulp-clean-css');
const imageMin      = require('gulp-imagemin');
const pngQuint      = require('imagemin-pngquant'); 
const browserSync   = require('browser-sync').create();
const autoprefixer  = require('gulp-autoprefixer');
const jpgRecompress = require('imagemin-jpeg-recompress'); 
const clean         = require('gulp-clean');
const replace       = require('gulp-replace');


// Paths
var paths = {
    root: { 
        www:        './public_html'
    },
    src: {
        root:       'public_html/assets',
        html:       'public_html/**/*.html',
        css:        'public_html/assets/css/*.css',
        js:         'public_html/assets/js/*.js',
        vendors:    'public_html/assets/vendors/**/*.*',
        imgs:       'public_html/assets/imgs/**/*.+(png|jpg|gif|svg)',
        scss:       'public_html/assets/scss/**/*.scss'
    },
    dist: {
        root:       'public_html/dist',
        css:        'public_html/dist/css',
        js:         'public_html/dist/js',
        imgs:       'public_html/dist/imgs',
        vendors:    'public_html/dist/vendors'
    }
}

// Compile SCSS
gulp.task('sass', function() {
    return gulp.src(paths.src.scss)
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError)) 
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.src.root + '/css'))
    .pipe(browserSync.stream());
});

// Minify + Combine CSS
gulp.task('css', function() {
    return gulp.src(paths.src.css)
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(concat('steller.css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.dist.css))
});

// Minify + Combine JS
gulp.task('js', function() {
    return gulp.src(paths.src.js)
    .pipe(uglify())
    .pipe(concat('steller.js'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.dist.js))
    .pipe(browserSync.stream());
});

// Compress (JPEG, PNG, GIF, SVG, JPG)
gulp.task('img', function(){
    return gulp.src(paths.src.imgs)
    .pipe(imageMin([
        imageMin.gifsicle(),
        imageMin.jpegtran(),
        imageMin.optipng(),
        imageMin.svgo(),
        pngQuint(),
        jpgRecompress()
    ]))
    .pipe(gulp.dest(paths.dist.imgs));
});

// copy vendors to dist
gulp.task('vendors', function(){
    return gulp.src(paths.src.vendors)
    .pipe(gulp.dest(paths.dist.vendors))
});

// clean dist
gulp.task('clean', function () {
    return gulp.src(paths.dist.root)
        .pipe(clean());
});

gulp.task('html', function(){
    return gulp.src(paths.src.html)
    .pipe(replace('assets/vendors/themify-icons/css/themify-icons.css', 'vendors/themify-icons/css/themify-icons.css'))
    .pipe(replace('assets/css/steller.css', 'css/steller.min.css'))
    .pipe(replace('assets/imgs/', 'imgs/'))
    .pipe(replace('assets/vendors/jquery/jquery-3.4.1.js', 'vendors/jquery/jquery-3.4.1.min.js'))
    .pipe(replace('assets/vendors/bootstrap/bootstrap.bundle.js', 'vendors/bootstrap/bootstrap.bundle.min.js'))
    .pipe(replace('assets/vendors/bootstrap/bootstrap.affix.js', 'vendors/bootstrap/bootstrap.affix.js'))
    .pipe(replace('assets/js/steller.js', 'js/steller.min.js'))
    .pipe(gulp.dest(paths.dist.root));
});


// Prepare all assets for production
gulp.task('build', gulp.series('sass', 'css', 'js', 'vendors', 'img', 'html'));


// Watch (SASS, CSS, JS, and HTML) reload browser on change
gulp.task('watch', function() {
    browserSync.init({
        server: {
            baseDir: paths.root.www
        } 
    })
    gulp.watch(paths.src.scss, gulp.series('sass'));
    gulp.watch(paths.src.js).on('change', browserSync.reload);
    gulp.watch(paths.src.html).on('change', browserSync.reload);
});