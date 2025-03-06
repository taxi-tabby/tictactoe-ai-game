import React, { useEffect, useRef } from 'react';
import { TicTacToeAI } from '../../schema/classes/model';
import { AudioManager } from '../../schema/classes/audio';
import { ImageLoader } from '../../schema/classes/image';
import Phaser, { Game } from "phaser";
import { motion } from 'framer-motion';
import MonitorComponent from '../component/monitorComponent';
interface LoadingSceneComponentProps {
    audioLoader: React.RefObject<AudioManager | null>;
    imageLoader: React.RefObject<ImageLoader | null>;
    modelLoader: React.RefObject<TicTacToeAI | null>;
}

export default function PhaserSceneComponent({
    audioLoader,
    imageLoader,
    modelLoader
}: LoadingSceneComponentProps) {

    console.log(audioLoader);
    console.log(imageLoader);
    console.log(modelLoader);


    //phaser game instance!
    const game = useRef<Game | null>(null);

    const phaserConfig: Phaser.Types.Core.GameConfig = {

        parent: 'phaser-game-container',
        width: 900,
        height: 600,
        type: Phaser.CANVAS,
        transparent: true,
        scene: {
            preload() {

            },
            create() {

            },
            update() { },
        }
    };

    useEffect(() => {

        //게임 초기화
        if (game.current) {
            game.current.destroy(true);
            game.current = null;
        }

        //게임 시작
        if (!game.current) game.current = new Game(phaserConfig);

        audioLoader.current?.play('ingame_bgm');

    }, []);


    return <>
        <motion.div
            key="scene-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, }}
        >
            <MonitorComponent>
                <div className="w-full h-full flex flex-col items-center justify-center">
                    <div id="phaser-game-container"></div>
                </div>
            </MonitorComponent>
        </motion.div>
    </>;
}
