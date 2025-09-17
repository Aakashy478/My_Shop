const path = require("path");
const nodeExternals = require("webpack-node-externals");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: "./app.js",           // main entry file
    target: "node",              // building for Node.js, not browser
    externals: [nodeExternals()],// exclude node_modules from bundle
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "build.js",
        clean: true,             // auto-clean build folder before new build
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: ".env", to: "." },          // copy env file
                { from: "views", to: "views" },     // copy EJS templates
                { from: "public", to: "public/images" },   // copy static files (css, js, images)
            ],
        }),
    ],
    optimization: {
        minimize: false, // no need to minify server-side code
    },
    stats: "minimal", // cleaner output logs
};
