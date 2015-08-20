var gulp = require('gulp'),
    del = require('del'),
    concat = require('gulp-concat'),
    mainFiles = require('bower-files'),
    merge = require('merge-stream'),
    fs = require('fs'),

    scssLint = require('gulp-scss-lint'),
    sass = require('gulp-ruby-sass'),
    cssPrefixer = require('gulp-autoprefixer'),
    cssMinify = require('gulp-minify-css'),

    jsLint = require('gulp-jshint'),
    jsLintRep = require('jshint-stylish'),
    jsMinify = require('gulp-uglify'),

    imageMin = require('gulp-imagemin'),

    node,
    spawn = require('child_process').spawn,
    exec = require('child_process').exec,

    src = 'src/',
    dist = 'dist/',
    bourbon = 'bower_components/bourbon/app/assets/stylesheets',
    neat = 'bower_components/neat/app/assets/stylesheets',
    hljs = 'bower_components/highlightjs/styles/zenburn.css',
    fa = {
        css: 'bower_components/fontawesome/css/font-awesome.css',
        fonts: 'bower_components/fontawesome/fonts/**.*'
    },
    paths = {
        js: src + 'js/**/*.js',
        scss: src + 'scss/**/*.scss',
        images: src + 'images/**/*.*',
        html: src + '**/*.html',
        bower: 'bower_components/**/*.*',
        scssMain: src + 'scss/main.scss',
        files: [
            // src +'browserconfig.xml',
            // src + 'manifest.json',
            src + '.htaccess'
        ],
        php: [
            'vendor/autoload.php',
            'vendor/composer/**/*.*',
            'vendor/firebase/**/*.*',
            'vendor/gabordemooij/**/*.*',
            'vendor/slim/**/*.*',
            'vendor/cebe/**/*.*'
        ],
        api: [
            src + 'api/**/**.*',
            src + 'api/.htaccess'
        ]
    };

gulp.task('clean', function() {
    return del(dist);
});

gulp.task('lint', ['lintJs', 'lintScss']);

gulp.task('lintJs', function() {
    return gulp.src(paths.js)
        .pipe(jsLint())
        .pipe(jsLint.reporter(jsLintRep));
});

gulp.task('lintScss', function() {
    return gulp.src(paths.scss)
        .pipe(scssLint({ config: 'lint.yml' }));
});

gulp.task('vendor', function() {
    var cssFiles = mainFiles().ext('css').files;
    cssFiles.push(fa.css);
    cssFiles.push(hljs);

    var js = gulp.src(mainFiles().ext('js').files)
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest(dist + 'lib/'));

    var css = gulp.src(cssFiles)
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest(dist + 'lib/'));

    var fonts = gulp.src(fa.fonts)
        .pipe(gulp.dest(dist + 'fonts/'));

    var merged = merge(js, css);
    merged.add(fonts);

    return merged;
});

gulp.task('minify', function() {
    // Minify vendor.js and vendor.css
    var vcss = gulp.src(dist + 'lib/vendor.css')
        .pipe(cssMinify())
        .pipe(gulp.dest(dist + 'lib/'));
    var vjs = gulp.src(dist + 'lib/vendor.js')
        .pipe(jsMinify({ preserveComments: 'some'}))
        .pipe(gulp.dest(dist + 'lib/'));

    // Minify project styles and scripts
    var css = gulp.src(dist + 'css/styles.css')
        .pipe(cssMinify())
        .pipe(gulp.dest(dist + 'css/'));
    var js = gulp.src(dist + 'js/app.js')
        .pipe(jsMinify({ preserveComments: 'some'}))
        .pipe(gulp.dest(dist + 'js/'));

    var merged = merge(vcss, vjs);
    merged.add(css);
    merged.add(js);

    return merged;
});

gulp.task('styles', function() {
    return sass(paths.scssMain,
            {
                precision: 10,
                loadPath: [
                    bourbon,
                    neat
                ]
            })
        .pipe(concat('styles.css'))
        .pipe(cssPrefixer())
        .pipe(gulp.dest(dist + 'css/'));
});

gulp.task('scripts', function() {
    return gulp.src(paths.js)
        .pipe(concat('app.js'))
        .pipe(gulp.dest(dist + 'js/'));
});

gulp.task('html', function() {
    return gulp.src(paths.html)
        .pipe(gulp.dest(dist));
});

gulp.task('files', function() {
    return gulp.src(paths.files)
        .pipe(gulp.dest(dist));
});

gulp.task('images', function() {
    return gulp.src(paths.images)
        .pipe(imageMin())
        .pipe(gulp.dest(dist + 'images/'));
});

gulp.task('php', function() {
    var vendor = gulp.src(paths.php, { base: 'vendor' })
        .pipe(gulp.dest(dist + 'api/vendor/'));

    var api = gulp.src(paths.api)
        .pipe(gulp.dest(dist + 'api/'));

    return merge(vendor, api);
});

gulp.task('apiChmod', ['php'],  function() {
    return fs.chmodSync(dist + 'api', 0777);
});

gulp.task('rssMkdir', ['php'],  function() {
    del.sync(dist + 'rss');
    fs.mkdirSync(dist + 'rss');

    return fs.chmodSync(dist + 'rss', 0777);
});

gulp.task('fbFlo', ['cleanupFbFlo'], function() {
    if (node) {
        node.kill();
    }

    node = spawn('node', ['flo.js'], {stdio: 'inherit'});
    node.on('close', function() {
        console.log('Exiting fb-flo.');
    });
});

gulp.task('cleanupFbFlo', function() {
    var fbFloRegex = /node\s_(\d+)\s/g,
        fbFloPs = exec('ps aux | grep "node flo.js"');

    fbFloPs.stdout.on('data', function(data) {
        data = data.split('\n');
        if (data) {
            var tmp;
            for (var i = 0; i < data.length; ++i) {
                tmp = data[i].split('  ');
                exec('kill -9 ' + tmp[2]);
                console.log('Killed orphaned fb-flo process.');
            }
        }
    });
});

gulp.task('watch', function() {
    var watchJs = gulp.watch(paths.js, ['lintJs', 'scripts']),
        watchScss = gulp.watch(paths.scss, ['lintScss', 'styles']),
        watchHtml = gulp.watch(paths.html, ['html']),
        watchImages = gulp.watch(paths.images, ['images']),
        watchFiles = gulp.watch(paths.files, ['files']),
        watchVendor = gulp.watch(paths.bower, ['vendor']),
        watchPhp = gulp.watch(paths.api, ['php']),

        onChanged = function(event) {
            console.log('File ' + event.path + ' was ' + event.type + '. Running tasks...');
        };

    gulp.start('fbFlo');

    watchJs.on('change', onChanged);
    watchScss.on('change', onChanged);
    watchHtml.on('change', onChanged);
    watchImages.on('change', onChanged);
    watchFiles.on('change', onChanged);
    watchVendor.on('change', onChanged);
    watchPhp.on('change', onChanged);
});

gulp.task('default', [
        'lint',
        'vendor',
        'styles',
        'scripts',
        'files',
        'html',
        'images',
        'php',
        'apiChmod',
        'rssMkdir']);
