var _ = require('lodash');
var webpack = require('webpack');
var argv = require('minimist')(process.argv.slice(2));

var DEBUG = !argv.release;

var GLOBALS = {
    'process.env.NODE_ENV': DEBUG ? '"development"' : '"production"',
    '__DEV__': DEBUG
};

// common starting point used for both client and server config
var config = {
    output: {
        path: './build/',
        publicPath: './',
        sourcePrefix: ''
    },

    cache: DEBUG,
    debug: DEBUG,
    devtool: DEBUG ? '#source-map' : false,

    stats: {
        colors: true,
        reasons: DEBUG
    },

    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.IgnorePlugin(/winston/),
        new webpack.PrefetchPlugin("react"),
        new webpack.PrefetchPlugin("react/lib/ReactComponentBrowserEnvironment")
    ],

    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx']
    },

    module: {
        loaders: [
            {
                test: /\.gif/,
                loader: 'url-loader?limit=10000&mimetype=image/gif'
            },
            {
                test: /\.jpg/,
                loader: 'url-loader?limit=10000&mimetype=image/jpg'
            },
            {
                test: /\.png/,
                loader: 'url-loader?limit=10000&mimetype=image/png'
            },
            {
                test: /\.svg/,
                loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
            },
            {
                test: /\.jsx?$/,
                loader: 'babel',
                query: {
                    presets: [
                        'react',
                        'es2015'
                    ]
                }
            }
        ]
    }
};

var clientConfig = _.merge({}, config, {
    entry: './src/client/client.js',
    output: {
        filename: 'client/client.js'
    },
    externals: {
        jquery: 'jQuery',
        react: 'React',
        io: 'io',
        q: 'Q',
        underscore: '_'
    },
    target: 'web',
    plugins: config.plugins.concat(
        [
            new webpack.DefinePlugin(_.merge(GLOBALS, {'__SERVER__': false}))
        ].concat(
            DEBUG ? [] :
                [
                    new webpack.optimize.DedupePlugin(),
                    new webpack.optimize.UglifyJsPlugin(),
                    new webpack.optimize.AggressiveMergingPlugin()
                ]
        )
    )
});

module.exports = [clientConfig];
