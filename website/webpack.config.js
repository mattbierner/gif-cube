"use strict";
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = (env, argv) => {
    const production = env && env.production;
    return {
        mode: production ? 'production' : 'development',
        entry: {
            main: './src/main.tsx'
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js']
        },
        output: {
            filename: "[name].js",
            path: path.join(__dirname, "js")
        },
        devtool: production ? '' : 'inline-source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                }
            ]
        },
        plugins: production
            ? [new UglifyJSPlugin()]
            : []
    };
};