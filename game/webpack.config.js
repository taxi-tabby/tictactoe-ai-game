module.exports = {
    style: {
        postcss: {
            plugins: [
                require("tailwindcss"),
                require("autoprefixer"),
            ],
        },
    },
    resolve: {
        alias: {
            'phaser': path.resolve(__dirname, './node_modules/phaser/dist/phaser.js'),
        },
    },
    module: {
        rules: [
            {
                test: /.tsx?$/,
                include: [path.resolve(__dirname, "src")],
                exclude: [path.resolve(__dirname, "node_modules")],
                loader: "babel-loader",
            },
            {
                test: /.css?$/,
                exclude: [],
                //로더는 오른쪽부터 읽어들이므로 postcss-loader를 맨 오른쪽에 넣어준다.
                use: ["style-loader", "css-loader", "postcss-loader"],
            },
        ],
    }
}