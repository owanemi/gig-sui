const path = require('path');

module.exports = {
    entry: './login/wallet.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'login')
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};