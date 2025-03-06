import React, { useEffect, useRef } from 'react';
import { TicTacToeAI } from '../../schema/classes/model';
import { AudioManager } from '../../schema/classes/audio';
import { ImageLoader } from '../../schema/classes/image';
import { tictactoeExtendsSpecialRules } from '../../schema/classes/tictactoeExtendsSpecialRules';
import Phaser, { Game } from "phaser";
import { motion } from 'framer-motion';
import MonitorComponent from '../component/monitorComponent';
import { clear } from 'console';
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
    const gameBehavior = useRef<tictactoeExtendsSpecialRules | null>(null);

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

    function showGameConfigToConsole(self: tictactoeExtendsSpecialRules) {
        console.log("Board Configuration:", self.getBoard());
        console.log("Controller:", self.getController());
        console.log("Current Player:", self.getCurrentPlayer());
        console.log("Board Size:", self.mapSizeX.value, 'x' ,self.mapSizeY.value);
    }

    useEffect(() => {

        //게임 초기화
        if (game.current) {
            game.current.destroy(true);
            game.current = null;
        }

        //게임 시작
        if (!game.current) {
            game.current = new Game(phaserConfig);
            gameBehavior.current = new tictactoeExtendsSpecialRules();
        }



        audioLoader.current?.play('ingame_bgm');//for test

        const testimer= setInterval(() => {
            console.log('freq', audioLoader.current?.getWaveformData('ingame_bgm'));
            
        }, 1000);

        gameBehavior.current?.gameStart((self) => {
            //플레이어 용도 랜덤 타일을 하나를 선택
            const whoIsYou = self.randomPlayerSelect();

            //누가 먼저 할 것인가 선택
            const whoPlayFirst = self.randomPlayerSelect();

            //그 타일을 플레이어(컨트롤 가능한 대상) 로 설정함
            self.setController(whoIsYou);

            //게임 시작 시 누가 먼저 할 것인가
            self.setCurrentPlayer(whoPlayFirst);

            //게임 보드 초기는 3x3으로 시작
            self.setBoardSize(3, 3);

            //출력ㅌxxx
            showGameConfigToConsole(self);
        });

        return () => {

            audioLoader.current?.stop('ingame_bgm');//for test

            clearInterval(testimer);

            game.current?.destroy(true);
            game.current = null;

            if (gameBehavior.current) {
                gameBehavior.current = null;
            }
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
