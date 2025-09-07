const path = require("path");
const nodeExternals = require("webpack-node-externals");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: "./app.js",
    target: "node",
    externals: [nodeExternals()],
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "build.js",
        clean: true, // auto-clean build folder before new build
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: ".env", to: "." } // copy .env directly into build/
            ],
        }),
    ],
    optimization: {
        minimize: false, // no need to minify server-side code
    },
    stats: "minimal", // cleaner output
};
