


// import { tictactoeExtendsSpecialRules } from "@/schema/classes/tictactoeExtendsSpecialRules";

import { ImageLoader } from "@/schema/classes/image";
import { TicTacToeAI } from "@/schema/classes/model";
import { tictactoeExtendsSpecialRules } from "../../schema/classes/tictactoeExtendsSpecialRules";
import { createAnimatedButton } from "../helper/create/button";
import createLayerContainer from "../helper/create/layerContainer";
import Color from '../../game-color-config';
import { parseColor } from "../helper/color/parser";


// import { TicTacToeAI } from '@/schema/classes/model';
// import { AudioManager } from '@/schema/classes/audio';
// import { ImageLoader } from '@/schema/classes/image';
// import { createAnimatedButton, createButton } from "@/components/scene/phaser/helper/create/button";
// // import { createAnimatedButton, createButton } from "@local/game/ helper/create/button";
// import createLayerContainer, { GridLayout } from "@/components/scene/phaser/helper/create/layerContainer";


export class GameScene extends Phaser.Scene {



    constructor() {
        super({
            key: 'GameScene',
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

            //승리조건
            self.setWinLength(4);

            //게임 보드 크기 설정
            const randomSize1 = Phaser.Math.Between(4, 4);
            const randomSize2 = Phaser.Math.Between(4, 4);
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
        this.load.aseprite('board_border_score', imageLoader.getImageAsBase64('board_border_score'), imageLoader.getFetchedDataURL('board_border_score'));
        this.load.aseprite('board_border_log', imageLoader.getImageAsBase64('board_border_log'), imageLoader.getFetchedDataURL('board_border_log'));

        // xo_sprite
        this.load.aseprite('xo_sprite', imageLoader.getImageAsBase64('xo_sprite'), imageLoader.getFetchedDataURL('xo_sprite'));




    }

    async create() {

   
        const system = new tictactoeExtendsSpecialRules();

        const modelLoader = this.registry.get('modelLoader') as TicTacToeAI;



        const color = {
            gameBg: parseColor(`${Color.background.game}`),
            border: parseColor(`${Color.secondary}`),
            markX: parseColor('#ff0000'),
            markO: parseColor('#fafafa'),
        };



        const sceneGameDone = () => {

        }

        const sceneGaming = async () => {
            // this.clearScene();

            //게임화면
            const gameScreenContainer = this.add.container(0, 0);

            //ui
            const uiGlobalTimerContainer = this.add.container(0, 0); //전체 타이머
            const uiSlideTimerContainer = this.add.container(0, 0); //슬라이드(각 턴당) 타이머
            const uiPauseContainer = this.add.container(0, 0); //정지버튼

            const uiGameContainer = this.add.container(0, 0); //ui 사각형 태두리를 포함함
            const uiBoardBorder = this.add.sprite(0, 0, 'board_border').setOrigin(0, 0).setTintFill(color.border.int);

            // const uiGameScoreRect = this.add.sprite(0, 0, 'board_border_score').setOrigin(0, 0).setTintFill(color.border.int);
            // const uiGameLogRect = this.add.sprite(0, 0, 'board_border_log').setOrigin(0, 0).setTintFill(color.border.int);

            const uiTestRect1 = this.add.rectangle(500, 30, 100, 60, color.border.int).setOrigin(0, 0).setFillStyle(color.border.int, 0.2);
            const uiTestRect2 = this.add.rectangle(500, 100, 140, 60, color.border.int).setOrigin(0, 0).setFillStyle(color.border.int, 0.2);
            const uiTestRect3 = this.add.rectangle(500, 270, 220, 160, color.border.int).setOrigin(0, 0).setFillStyle(color.border.int, 0.2);
            const uiTestRect4 = this.add.rectangle(500, 450, 350, 100, color.border.int).setOrigin(0, 0).setFillStyle(color.border.int, 0.2);
            const uiTestRect5 = this.add.rectangle(780, 30, 70, 40, color.border.int).setOrigin(0, 0).setFillStyle(color.border.int, 0.2);

            const uiTestText1 = this.add.text(516, 60, '99:99', { font: '36px Silver', color: '#fafafa', letterSpacing: 4 }).setOrigin(0, 0.5).setAlpha(0.7);    
            const uiTestText2 = this.add.text(516, 130, '00:05', { font: '36px Silver', color: '#fafafa', letterSpacing: 4 }).setOrigin(0, 0.5).setAlpha(0.7);    
            const uiTestText3 = this.add.text(596, 130, '+5', { font: '24px Silver', color: '#fafafa', letterSpacing: 2 }).setOrigin(0, 0.5).setAlpha(0.7);    
            const uiTestText4 = this.add.text(520, 290, 'x: 3, y: 3\nx: 2, y: 1\nx: 2, y: 1\nx: 2, y: 1\n플레이어 승리\n3라운드', { font: '24px Silver', color: '#fafafa', letterSpacing: 1, lineSpacing: 2 }).setOrigin(0, 0).setAlpha(0.7);    

            const uiScorePrefixText = this.add.text(0, 0, 'SCORE', { font: '48px Silver', color: '#fafafa', letterSpacing: 4 }).setOrigin(0, 0.5);      
            const uiScoreValueText = this.add.text(0, 0, '123,456,789,000,000', { font: '36px Silver', color: '#fafafa', letterSpacing: 2 }).setOrigin(0, 0.5);      
            uiGameContainer.add([uiBoardBorder, uiScorePrefixText, uiScoreValueText]);


            //게임 시작 전 카운트 다운
            const gameStartCountDownContainer = this.add.container(0, 0);

            //게임 속 화면
            const gameContainer = this.add.container(0, 0);

            //게임 배경
            const backgroundContainer = this.add.container(0, 0);
            const backgroundGraphic = this.add.rectangle(0, 0, 900, 600, color.gameBg.int).setOrigin(0, 0);
            backgroundContainer.add(backgroundGraphic);

            const foregroundContainer = this.add.container(0, 0);


            //효과
            const scapeParticleContainer = this.add.container(0, 0); //전역 파티클
            const tileParticleContainer = this.add.container(0, 0); //타일 파티클
            const foregroundEffectContainer = this.add.container(0, 0); //전면 화면 효과


            //게임 보드

            const layer_gameBoard = createLayerContainer(this, 'layer_globalContainer', {w: 400, h: 500}, 0, 3, 3);

            // 레이어들을 게임 컨테이너에 추가
            gameContainer.add([layer_gameBoard]);

  


            this.anims.create({
                key: 'EMPTY_ANIMATION', 
                frames: this.anims.generateFrameNames('xo_sprite', { 
                    start: 0, 
                    end: 17,  
                    prefix: 'xo_animation (EMPTY_ANIMATION) ', 
                    suffix: '.aseprite' 
                }),
                frameRate: 10, 
                repeat: -1
            });

            this.anims.create({
                key: 'O_ANIMATION', 
                frames: this.anims.generateFrameNames('xo_sprite', { 
                    start: 0, 
                    end: 17,  
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
                    end: 17,  
                    prefix: 'xo_animation (X_ANIMATION) ', 
                    suffix: '.aseprite' 
                }),
                frameRate: 10, 
                repeat: -1,
            });





            // 컨테이너 깊이 설정
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
            uiGameContainer.setDepth(11);


            //위치 설정
            gameContainer.setPosition(50, 50);
            uiBoardBorder.setPosition(30, 20).setScale(1.1, 1.08);
            // uiGameScoreRect.setPosition(500, 100);
            // uiGameLogRect.setPosition(500, 280);
            uiScorePrefixText.setPosition(530, 485);
            uiScoreValueText.setPosition(530, 515);
            

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
                uiGameContainer
                // layer_gameBoard,
            ]);

            gameScreenContainer.sort('depth');



            const renderBoard = () => {
                layer_gameBoard.clearAllObjects();
                system.getBoard().forEach((row, y) => {
                    row.forEach((tile, x) => {
                        var btn: Phaser.GameObjects.Sprite | undefined = undefined;
                        
                        if (tile == '2') {
                            btn = createAnimatedButton(this, 0, 0, 'O_ANIMATION', 'O_ANIMATION', () => {

                            }).setOrigin(0.5 , 0.5);
                        } else if (tile == '1') {
                            btn = createAnimatedButton(this, 0, 0, 'X_ANIMATION', 'X_ANIMATION', () => {

                            }).setOrigin(0.5 , 0.5);
                        } else {
                            btn = createAnimatedButton(this, 0, 0, 'EMPTY_ANIMATION', 'EMPTY_ANIMATION', () => {
                                console.log('Click:', x, y);
                                system.makeMove(y, x);
                                const check = system.checkWinner();
                                renderBoard();

                                if (check.type == 'tile') {
                                    if (check.pattern != undefined) {
                                        const lineGraphics = this.add.graphics();
                                        lineGraphics.lineStyle(5, 0xff0000, 0.4);

                                        check.pattern.forEach((point, index) => {
                                            const cellBounds = layer_gameBoard.getCellBoundsByPos(point[0], point[1]);
                                            if (cellBounds) {

                                                const w = Math.floor(cellBounds.topRight.x - cellBounds.topLeft.x);
                                                const h = Math.floor(cellBounds.bottomLeft.y - cellBounds.topLeft.y);

                                                // 중앙 좌표 계산
                                                const centerX = cellBounds.topLeft.x + (w);
                                                const centerY = cellBounds.topLeft.y + (h) - 10;
                                        
                                                // 선 그리기
                                                if (index === 0) {
                                                    lineGraphics.moveTo(centerX, centerY);
                                                } else {
                                                    lineGraphics.lineTo(centerX, centerY);
                                                }
                                            }
                                        });
                                        lineGraphics.strokePath();
                                    }
                                    console.log('Winner:', check.value);
                                }
                                
                            }).setOrigin(0.5 , 0.5);
                        }
                        
                        if (btn !== undefined) {
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
                        }

                    });
                });

                //위치 업데이트
                layer_gameBoard.layoutGrid();
            };




            //정지 하면 나오는 화면
            //환경설정 및 이어하기, 그만하기 버튼 존재
            // const pauseScreenContainer = this.add.container(0, 0);


            system.gameStart(async (self) => {

                this.gameStartInit(self);


                renderBoard();





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
        sceneGameDone();
        sceneGaming();
    }

    update() {
        // 매 프레임마다 실행되는 코드
    }
}
