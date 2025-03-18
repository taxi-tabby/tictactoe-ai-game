import React, { useEffect, useRef } from 'react';


import { motion } from 'framer-motion';
import Phaser, { Game } from "phaser";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import MonitorComponent from '@local/components/component/monitorComponent';
import { EmptyScene } from '@local/game/scene/empty';
import { MainScene } from '@local/game/scene/main';
import { GameScene } from '@local/game/scene/game';
import { TicTacToeAI } from '@local/schema/classes/model';
import { AudioManager } from '@local/schema/classes/audio';
import { ImageLoader } from '@local/schema/classes/image';



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

    // console.log(audioLoader);
    // console.log(imageLoader);
    // console.log(modelLoader);


    //phaser game instance!
    const game = useRef<Game | null>(null);

    const xx: Phaser.Types.Core.PipelineConfig = {  };

    const phaserConfig: Phaser.Types.Core.GameConfig = {
        parent: 'phaser-game-container',
        width: 900,
        height: 600,
        type: Phaser.WEBGL,
        transparent: true,
        scene: [EmptyScene, MainScene, GameScene],
        banner: false,
        title: 'TicTacToe with ai by taxi_tabby',
        // backgroundColor: '#333',

        mode: Phaser.Scale.RESIZE, // 화면 크기 변경을 허용
        // autoCenter: Phaser.Scale.CENTER_BOTH, // 화면 중앙에 위치
        


        plugins: {
            scene: [
                {
                    key: 'rexUI',
                    plugin: RexUIPlugin,
                    mapping: 'rexUI',
                },
            ]
        },



        pixelArt: false,
        antialias: true,
        antialiasGL: true,
        // input: {
        //     activePointers: 3, // 마우스 또는 터치포인터의 최대 수
        //     mouse: true,
        //     touch: true,
        //     windowEvents: true
        // },
        loader: {
            // baseURL: 'assets/',  // 자산의 기본 경로
            crossOrigin: 'anonymous', // CORS 처리
        },
        // fps: {
        //     // target: 60,  // 목표 FPS: 초당 60 프레임
        //     // forceSetTimeOut: true,  // `requestAnimationFrame`을 사용할지 여부 (기본값: `false`)
        //     // min: 30,  // 최소 FPS: 30 이하로 내려가지 않도록 제한
        //     // limit: 120,
        //     // smoothStep: true,
        //     // panicMax: 45,

        // },

    };


    //초기화
    useEffect(() => {

        //게임 초기화
        if (game.current) {
            game.current.destroy(true);
            game.current = null;
        }

        //게임 시작
        if (!game.current) {


            game.current = new Game({
                ...phaserConfig,
            });
            game.current.scene.start('GameScene');
            game.current.registry.set('audioLoader', audioLoader.current);
            game.current.registry.set('imageLoader', imageLoader.current);
            game.current.registry.set('modelLoader', modelLoader.current);



        }


        // audioLoader.current?.play('ingame_bgm');//for test

        // const testimer= setInterval(() => {
        //     console.log('freq', audioLoader.current?.getWaveformData('ingame_bgm'));

        // }, 1000);


        // game.current.config as Phaser.Types.Core.tictactoePhaserGameConfig;
        // game.current?.gameStart((self) => {
        //     //플레이어 용도 랜덤 타일을 하나를 선택
        //     const whoIsYou = self.randomPlayerSelect();

        //     //누가 먼저 할 것인가 선택
        //     const whoPlayFirst = self.randomPlayerSelect();

        //     //그 타일을 플레이어(컨트롤 가능한 대상) 로 설정함
        //     self.setController(whoIsYou);

        //     //게임 시작 시 누가 먼저 할 것인가
        //     self.setCurrentPlayer(whoPlayFirst);

        //     //게임 보드 초기는 3x3으로 시작
        //     self.setBoardSize(3, 3);

        //     //출력ㅌxxx
        //     showGameConfigToConsole(self);
        // });



        //초기화 회수
        return () => {

            // audioLoader.current?.stop('ingame_bgm');//for test

            // clearInterval(testimer);

            game.current?.destroy(true);
            game.current = null;

            // if (gameBehavior.current) {
            //     gameBehavior.current = null;
            // }
        }


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
