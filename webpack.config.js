const path = require('path');

module.exports = {
    entry: './src/JavaScript/graphs_maps/main.js', // Entry point where Webpack starts bundling
    output: {
        filename: 'bundle.js', // The output file after bundling
        path: path.resolve(__dirname, 'src/dist'), // Output directory
    },
    module: {
        rules: [
            {
                test: /\.js$/, // Regex to test for JavaScript files
                exclude: /node_modules/, // Don't transpile node_modules
                use: {
                    loader: 'babel-loader', // Transpile modern JavaScript to backward-compatible JavaScript
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
    resolve: {
        extensions: ['.js'], // Resolve JS extensions automatically
    },
    devtool: 'source-map', // Include source maps for easier debugging
    mode: 'development', // Set mode to development (you can switch to 'production' for production build)
};
