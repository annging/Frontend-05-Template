const webpack = require('webpack'); //to access built-in plugins
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/main.js',
    module: {
        rules: [
            { test: /\.vue$/, use: 'vue-loader' },
            // 它会应用到普通的 `.css` 文件
            // 以及 `.vue` 文件中的 `<style>` 块
            {
                test: /\.css$/,
                use: [
                'vue-style-loader',
                'css-loader'
                ]
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new CopyPlugin({
            patterns: [
                { from: 'src/*.html', to: '[name].[ext]' }
            ],
        }),
    ]
};