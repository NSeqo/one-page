

const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const copyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
    mode: 'development',
    entry: './src/assets/js/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },

    performance: {
        hints: false
    },

    module: {
        rules: [ // 这里css文件处理是为了背景图中引入的图片路径
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader'
                ]
            }
        ]
    },


    devServer: {
        contentBase: path.join(__dirname, "dist"),
        compress: true,
        port: 9000,
        // 接口代理
        proxy: {
            "/recyclePlatform": "http://localhost:8080"
        }
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html"
        }),
        new copyWebpackPlugin({
            patterns: [
                { from: "./src/assets", to: 'assets' },
            ]
        })
    ]
};