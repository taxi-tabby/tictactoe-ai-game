import { TictactoeGameStatus } from "../../../../schema/classes/tictactoe";
import { tictactoeExtendsSpecialRules } from "../../../../schema/classes/tictactoeExtendsSpecialRules";
import { TicTacToeAI } from '../../../../schema/classes/model';
import { AudioManager } from '../../../../schema/classes/audio';
import { ImageLoader } from '../../../../schema/classes/image';
import { createTextButton } from "../helper/create/textButton";
import { createAnimatedButton, createButton } from "../helper/create/button";
import createLayerContainer, { GridLayout } from "../helper/create/layerContainer";
import { model } from "@tensorflow/tfjs";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { calcGridPercent } from "../../../../schema/classes/math";
import { fillTargetColorToAnotherColor, vertexShader } from "../helper/shader/shader.color.fill";



export class GameScene extends Phaser.Scene {



    constructor() {
        super({
            key: 'GameScene',
            // plugins: {
            //     scene: [
            //         {
            //             key: 'rexUI',
            //             plugin: RexUIPlugin,
            //             mapping: 'rexUI'
            //         },
            //     ]
            // }
        });
    }

    private gameStartInit(self: tictactoeExtendsSpecialRules) {
        self.gameStart((self) => {
            //플레이어 용도 랜덤 타일을 하나를 선택
            const whoIsYou = self.randomPlayerSelect();

            //누가 먼저 할 것인가 선택
            const whoPlayFirst = self.randomPlayerSelect();

            //그 타일을 플레이어(컨트롤 가능한 대상) 로 설정함
            self.setController(whoIsYou);

            //게임 시작 시 누가 먼저 할 것인가
            self.setCurrentPlayer(whoPlayFirst);

            //게임 보드 초기는 3x3으로 시작
            const randomSize1 = Phaser.Math.Between(3, 9);
            const randomSize2 = Phaser.Math.Between(3, 9);
            self.setBoardSize(randomSize1, randomSize2);

            //출력ㅌxxx
            this.showGameConfigToConsole(self);


        });
    }

    private showGameConfigToConsole(self: tictactoeExtendsSpecialRules) {
        console.log("Board Configuration:", self.getBoard());
        console.log("Controller:", self.getController());
        console.log("Current Player:", self.getCurrentPlayer());
        console.log("Board Size:", self.mapSizeX.value, 'x', self.mapSizeY.value);
    }

    private clearScene() {
        this.children.removeAll();
    }


    async preload() {
        console.clear();

        const audioLoader = this.registry.get('audioLoader');
        const imageLoader = this.registry.get('imageLoader') as ImageLoader;

        this.load.image('particle', imageLoader.getImageAsBase64('repo_wolf'));
        this.load.image('main_bg_1', imageLoader.getImageAsBase64('main_bg_1'));
        this.load.aseprite('test_sprite', imageLoader.getImageAsBase64('test_sprite'), imageLoader.getFetchedDataURL('test_sprite'));

        this.load.aseprite('board_border', imageLoader.getImageAsBase64('board_border'), imageLoader.getFetchedDataURL('board_border'));

        // xo_sprite
        // const xo_sprite_json = await imageLoader.getFetchedDataInRaw('xo_sprite');
        this.load.aseprite('xo_sprite', imageLoader.getImageAsBase64('xo_sprite'), imageLoader.getFetchedDataURL('xo_sprite'));




    }

    async create() {

   
        const system = new tictactoeExtendsSpecialRules();

        const modelLoader = this.registry.get('modelLoader') as TicTacToeAI;

        // const t = this.textures.get('board_border');
        // const render = new Phaser.Display.BaseShader('Test', fillTargetColorToAnotherColor, vertexShader);
        // const shader = this.add.shader(render, 0, 0, 600, 500, [t.key]);
        // shader.setRenderToTexture();

        this.anims.create({
            key: 'O_ANIMATION', 
            frames: this.anims.generateFrameNames('xo_sprite', { 
                start: 0, 
                end: 4,  
                prefix: 'xo_animation (O_ANIMATION) ', 
                suffix: '.aseprite' 
            }),
            frameRate: 10, 
            repeat: -1
        });

        this.anims.create({
            key: 'X_ANIMATION', 
            frames: this.anims.generateFrameNames('xo_sprite', { 
                start: 0, 
                end: 4,  
                prefix: 'xo_animation (X_ANIMATION) ', 
                suffix: '.aseprite' 
            }),
            frameRate: 10, 
            repeat: -1
        });



        const sceneGameDone = () => {
            // this.clearScene();
            // this.add.text(10, 10, 'Game Over', {
            //     fontSize: '32px',
            //     color: '000'
            // });
            // const restartButton = this.add.text(10, 50, 'Restart Game', {
            //     fontSize: '32px',
            //     color: '#ff0000'
            // }).setInteractive({ useHandCursor: true });
            // restartButton.on('pointerdown', () => {
            //     sceneGaming();
            // });
        }

        const sceneGaming = async () => {
            // this.clearScene();

            //게임화면
            const gameScreenContainer = this.add.container(0, 0);

            //ui
            const uiGlobalTimerContainer = this.add.container(0, 0); //전체 타이머
            const uiSlideTimerContainer = this.add.container(0, 0); //슬라이드(각 턴당) 타이머
            const uiPauseContainer = this.add.container(0, 0); //정지버튼

            //게임 시작 전 카운트 다운
            const gameStartCountDownContainer = this.add.container(0, 0);

            //게임 속 화면
            const gameContainer = this.add.container(0, 0);

            //게임 배경
            const backgroundContainer = this.add.container(0, 0);
            const foregroundContainer = this.add.container(0, 0);


            //효과
            const scapeParticleContainer = this.add.container(0, 0); //전역 파티클
            const tileParticleContainer = this.add.container(0, 0); //타일 파티클
            const foregroundEffectContainer = this.add.container(0, 0); //전면 화면 효과


            //게임 보드

            const layer_gameBoard = createLayerContainer(this, 'layer_globalContainer', {w: 400, h: 500}, 0, 3, 3);


            const layer_boardBorder = this.add.sprite(0, 0, 'board_border').setOrigin(0, 0).setTintFill(0xfafafa).setAlpha(0.6);

            
            // const btn_test = createTextButton(this, 0, 0, 'Test Button', () => {}, {font: '50px Silverfont', color: '#fafafa'}).setOrigin(0, 0);



            // 레이어들을 게임 컨테이너에 추가
            gameContainer.add([layer_gameBoard, layer_boardBorder]);
            layer_boardBorder.setDepth(0);
            layer_gameBoard.setDepth(1);
            gameContainer.sort('depth');

  

            // 컨테이너 깊이 설정
            // layer_gameBoard.setDepth(0);
            backgroundContainer.setDepth(1);
            gameContainer.setDepth(2);
            scapeParticleContainer.setDepth(3);
            tileParticleContainer.setDepth(4);
            foregroundContainer.setDepth(5);
            foregroundEffectContainer.setDepth(6);
            uiGlobalTimerContainer.setDepth(7);
            uiSlideTimerContainer.setDepth(8);
            gameStartCountDownContainer.setDepth(9);
            uiPauseContainer.setDepth(10);


            //서브컨테이너로 넣기
            gameScreenContainer.add([
                backgroundContainer,
                gameContainer,
                foregroundContainer,
                scapeParticleContainer,
                tileParticleContainer,
                foregroundEffectContainer,
                uiGlobalTimerContainer,
                uiSlideTimerContainer,
                uiPauseContainer,
                gameStartCountDownContainer,
                // layer_gameBoard,
            ]);

            gameScreenContainer.sort('depth');


            //위치 설정
            gameContainer.setPosition(50, 50);
            



            //정지 하면 나오는 화면
            //환경설정 및 이어하기, 그만하기 버튼 존재
            // const pauseScreenContainer = this.add.container(0, 0);


            system.gameStart(async (self) => {

                this.gameStartInit(self);

                layer_gameBoard.clearAllObjects();

                system.getBoard().forEach((row, y) => {
                    row.forEach((tile, x) => {

                        const btn = createAnimatedButton(this, 0, 0, 'O_ANIMATION', 'X_ANIMATION', () => {
                            console.log('Click:', x, y);
                        }).setOrigin(0.5 , 0.5);


                        // const btn = createTextButton(this, 0, 0, '', () => {}, {
                        //     font: '50px Silver',
                        //     color: '#fafafa',
                        //     backgroundColor: 'rgba(255, 0, 0, 0.35)',
                        //     align: 'center',
                        // });


                        layer_gameBoard.addToGrid(btn, x, y, {
                            callbackRenderUpdate: (object) => {
                                const btnBuff: Phaser.GameObjects.Sprite = object;
                                const bounds = layer_gameBoard.getCellBoundsByObject(btnBuff);
                                if (bounds === null) return;
                                const w = Math.floor(bounds.topRight.x - bounds.topLeft.x);
                                const h = Math.floor(bounds.bottomLeft.y - bounds.topLeft.y);
                                // btnBuff.setText(`${tile.toString()}`);
                                btnBuff.setPosition(bounds.topLeft.x + (w / 2), bounds.topLeft.y + (h / 2));
                            }
                        });
                    });
                });


                //위치 업데이트
                layer_gameBoard.layoutGrid();





                const pre = await modelLoader.predict('4x4_4', { x: 4, y: 4 }, [
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 1, 0],
                    [0, 0, 0, 0],
                ]);
                console.log('AI Prediction:', pre);


            });

        }



        //화면을 랜더링 함
        await sceneGameDone();
        await sceneGaming();
    }

    update() {
        // 매 프레임마다 실행되는 코드
    }
}
