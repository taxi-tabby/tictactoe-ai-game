const path = require('path');

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
        modules: [
            "node_modules",
            path.resolve(__dirname, "src"),
        ],
        alias: {
            'phaser': path.resolve(__dirname, './node_modules/phaser/dist/phaser.js'),
            '@local': path.resolve(__dirname, 'src/'),
            '@local/game/scene/*': path.resolve(__dirname, 'src/components/scene/phaser/scene/*'),
            '@local/game/helper/*': path.resolve(__dirname, 'src/components/scene/phaser/helper/*'),
            '@local/game/schema/*': path.resolve(__dirname, 'src/schema/*'),
            '@local/game/config/asset': path.resolve(__dirname, 'src/game-assets-config.ts'),
            '@local/game/config/color': path.resolve(__dirname, 'src/game-color-config.ts')
        },
        // extensions: ['.ts', '.js', '.json']
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