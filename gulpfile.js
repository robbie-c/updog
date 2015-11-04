// Include Gulp and other build automation tools and utilities
// See: https://github.com/gulpjs/gulp/blob/master/docs/API.md
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var webpack = require('webpack');
var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var nodemon = require('gulp-nodemon');
var shell = require('gulp-shell');

var watch = false;
var exitCode = 0;

// The default task
gulp.task('default', ['build']);

// Clean output directory
gulp.task('clean', del.bind(
    null, ['build/*', '!build/.git'], {dot: true}
));

// Bundle
gulp.task('bundle', function (cb) {

    if (watch) {
        var started = false;
        var config = require('./webpack.config.js');
        var bundler = webpack(config);

        function bundle(err, stats) {
            if (err) {
                throw new $.util.PluginError('webpack', err);
            }

            if (argv.verbose) {
                $.util.log('[webpack]', stats.toString({colors: true}));
            }

            if (!started) {
                started = true;
                return cb();
            }
        }
        bundler.watch(200, bundle);
    } else {

        var webpackProcess = /^win.*/.test(process.platform) ?
            path.join('node_modules', '.bin', 'webpack.cmd') :
            path.join('node_modules', '.bin', 'webpack');

        return require('child_process')
            .spawn(webpackProcess, ['--config', 'webpack.config.js', '--verbose', '--bail', '--colors'], { stdio: 'inherit' })
            .on('close', function (code) {
                console.log('code = ' + code);
                if (code) {
                    exitCode = code;
                    cb(new Error('Webpack failed with exit code: ' + code));
                } else {
                    cb();
                }

            });
    }
});

// Build the app from source code
gulp.task('build:incremental', function (cb) {
    runSequence(['bundle', 'vendor'], cb);
});

// Build the app from source code
gulp.task('build', ['clean'], function (cb) {
    runSequence(['bundle', 'vendor'], cb);
});

gulp.task('vendor', function () {
    var node_modules = path.join(__dirname, 'node_modules');

    var vendor = [
        path.join(node_modules, 'jquery', 'dist', 'jquery.min?(.js|.map)'),
        path.join(node_modules, 'underscore', 'underscore-min?(.js|.map)*'),
        path.join(node_modules, 'react', 'dist', 'react.min.js*'),
        path.join(node_modules, 'react-dom', 'dist', 'react-dom.min.js*')
    ];

    return gulp.src(vendor)
        .pipe(gulp.dest('build/client/vendor'))
});

// Build and start watching for modifications
gulp.task('dev', function () {
    runSequence('build:incremental', function () {
        nodemon({
            script: 'src/runServer.js',
            tasks: ['build:incremental'],
            env: {
                'NODE_ENV': 'development'
            },
            ext: 'js jsx jade css html png css json'
        });
    });
});

// Stop on first error
gulp.on('err', function () {
    process.emit('exit'); // or throw err
});

// Make sure we have the right exit code when exiting
process.on('exit', function () {
    process.nextTick(function () {
        process.exit(exitCode);
    });
});
