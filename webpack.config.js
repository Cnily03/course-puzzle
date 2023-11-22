const webpack = require('webpack');
const path = require('path');
const MinifyEJSContent = require("./webpack-ejs-minify-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require("terser-webpack-plugin");

const OUTPUT_DIR = (process.env.OUTPUT_DIR || "dist").trim();

const MODE = (process.env.NODE_ENV || "production").trim() === "production" ? "production" : "development";
const IS_DEV = MODE === "development";

const StyleLoader = MiniCssExtractPlugin.loader || 'style-loader';

module.exports = {
    entry: {
        index: path.join(__dirname, './src/scripts/index.mjs')
    },

    output: {
        path: path.join(__dirname, `./${OUTPUT_DIR}/`),
        filename: '[name].js'
    },

    mode: MODE,
    devtool: IS_DEV ? "source-map" : undefined,
    devServer: {
        static: [{
            directory: path.join(__dirname, './static')
        }, {
            directory: path.join(__dirname, './views')
        }],
        compress: true,
        port: 9960
    },

    module: {
        rules: [{ // CSS
            test: /\.css$/i,
            use: [StyleLoader, 'css-loader']
        }, { // SCSS
            test: /\.s[ac]ss$/i,
            use: [StyleLoader, 'css-loader', 'sass-loader']
        }, { // Image File
            test: /\.(png|jpe?g|svg|gif|webp)$/i,
            type: 'asset',
            generator: {
                filename: 'images/[hash][ext][query]'
            },
            parser: {
                dataUrlCondition: {
                    maxSize: 32 * 1024 // 限制大小（单位：字节）
                }
            }
        }].concat(IS_DEV ? [ // Dev Only
        ] : [ // Production Only
            { // JS
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ])
    },

    plugins: [
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [
                "**/*"
            ]
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
        new CopyPlugin({
            patterns: [
                { from: "static", to: "." },
            ],
        }),
        new MinifyEJSContent({
            entryDir: "views",
            outDir: `./${OUTPUT_DIR}/`,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                preserveLineBreaks: true,
                minifyJS: true,
                minifyCSS: true
            }
        })
    ],

    optimization: {
        minimize: true,
        minimizer: [
            new CssMinimizerPlugin(), // 优化 Minify CSS
            new TerserWebpackPlugin({
                parallel: true,
                extractComments: false,
                terserOptions: {
                    ecma: undefined,
                    parse: {},
                    compress: {
                        dead_code: false, // 移除没被引用的代码
                        loops: true, // 当循环的判断条件可以确定时，对其进行优化
                        drop_debugger: false,
                        drop_console: false, // 移除全部 console
                        pure_funcs: IS_DEV ? [] : ['console.log'] // 移除特定函数
                    }
                }
            })
        ],
    },

    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@js': path.resolve(__dirname, './src/scripts'),
            '@css': path.resolve(__dirname, './src/stylesheets')
        }
    },

    performance: {
        hints: false
    }
}