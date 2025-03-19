import { resolve as _resolve } from 'path';

import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

export const style = {
    postcss: {
        plugins: [
            require("tailwindcss"),
            require("autoprefixer"),
        ],
    },
};
export const resolve = {
    modules: ["node_modules", _resolve(__dirname, "src")],
    plugins: [new TsconfigPathsPlugin()],
    alias: {
        '@': _resolve(__dirname, './src/'),
        'phaser': _resolve(__dirname, './node_modules/phaser/dist/phaser.js'),
        '@local-schema': _resolve(__dirname, './src/schema'),
        "@local-config/assets": _resolve(__dirname, "./src/game-assets-config.ts"),
        "@local-config/color": _resolve(__dirname, "./src/game-color-config.ts")
    }
};
export const module = {
    rules: [
        {
            test: /.tsx?$/,
            include: [_resolve(__dirname, "src")],
            exclude: [_resolve(__dirname, "node_modules")],
            loader: "babel-loader",
        },
        {
            test: /.css?$/,
            exclude: [],

            //로더는 오른쪽부터 읽어들이므로 postcss-loader를 맨 오른쪽에 넣어준다.
            use: ["style-loader", "css-loader", "postcss-loader"],
        },
    ],
};