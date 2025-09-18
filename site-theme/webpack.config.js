import path from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
// import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const __dirname = path.resolve();

const tsconfig = {
    mode: "development",
    watch: false,

    context: __dirname,
    entry: './source/ts/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "[name].js"
    },

    module: {
        rules: [
            {
                test: /\.([cm]?ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        projectReferences: true,
                    }
                }
            }
        ]
    },
    resolve: {
        modules: [
            "node_modules",
            path.resolve(__dirname),
        ],
        extensions: ['.ts', '.tsx', '.js'],
        extensionAlias: {
        ".js": [".js", ".ts"],
        ".cjs": [".cjs", ".cts"],
        ".mjs": [".mjs", ".mts"]
        },
        plugins: [
            new TsconfigPathsPlugin({
                logLevel: "info",
                mainFields: "module",
                extensions: [".js", ".ts", ".tsx"]
            })
        ]
    },
    plugins: [

    ]
};

// const sassConfig = {
//     mode: "development",
//     watch: false,
    
//     context: __dirname,
//     entry: './source/main.scss',
//     output: {
//         path: path.resolve(__dirname, 'dist'),
//         filename: "[name].tmp.js"
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.s[ac]ss$/i,
//                 use: [
//                     // // Creates `style` nodes from JS strings
//                     // "style-loader",
//                     MiniCssExtractPlugin.loader,
//                     // Translates CSS into CommonJS
//                     "css-loader",
//                     // Compiles Sass to CSS
//                     "sass-loader",
//                 ],
//             },
//         ],
//     },
//     resolve: {
//         modules: [
//             "node_modules",
//             path.resolve(__dirname),
//         ],
//         extensions: ['.scss', '.css'],
//     },
//     plugins: [
//         new MiniCssExtractPlugin({
//             filename: "[name].css",
//             //chunkFilename: "[id].css"
//         })
//     ]
// };

// export default [tsconfig, sassConfig];
export default tsconfig;