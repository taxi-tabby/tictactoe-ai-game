


// import { tictactoeExtendsSpecialRules } from "@/schema/classes/tictactoeExtendsSpecialRules";

import { ImageLoader } from "@/schema/classes/image";
import { TicTacToeAI } from "@/schema/classes/model";
import { tictactoeExtendsSpecialRules } from "../../schema/classes/tictactoeExtendsSpecialRules";
import { createAnimatedButton } from "../helper/create/button";
import createLayerContainer from "../helper/create/layerContainer";
import Color from '../../game-color-config';
import { parseColor } from "../helper/color/parser";
import { createText } from "../helper/create/text";
import { TictactoeGameStatus } from "../../schema/classes/tictactoe";


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

    private firstRun = true;

    init() {

        const system = new tictactoeExtendsSpecialRules();
        this.data.set('boardSystem', system);

        //변수 생성
        this.data.set('boardWinCondition', <number>0);
        this.data.set('boardRow', <number>0);
        this.data.set('boardCol', <number>0);

        this.data.set('globalScore', <BigInt>BigInt(0));
        this.data.set('currentRound', <number>0);
        this.data.set('currentTurn', <number>0);

        this.data.set('gameGlobalStartTime', Date.now());
        this.data.set('gameRoundStartTime', Date.now());
        this.data.set('gameTurnStartTime', Date.now());

        this.data.set('globalTime', <number>300000);
        this.data.set('slideTime', <number>0);
        this.data.set('logArray', <string[]>[]);


    }


    private nextRound() {
        this.data.values.gameRoundStartTime = Date.now(); //라운드 시작 시간 초기화
        this.data.values.currentRound++; //다음 라운드
        this.nextTurn();
    }

    private nextTurn() {
        this.data.values.gameTurnStartTime = Date.now(); //턴 시작 시간 초기화
        this.data.values.currentTurn++; //다음 턴
        this.data.values.slideTime = 5000; //매 턴 5초
    }

    /**
     * 다중 차원에 의한 마르코프 결정을 통한 최적의 보드 수 계산
     */
    private async boardPickNumberByMarkovDecisionOnMultiDimension(boardAsNumbers: number[][] = [], depth: number = 1) {
        //보드를 현재의 구함           
        const modelLoader = this.registry.get('modelLoader') as TicTacToeAI;

        const boardRow = this.data.get('boardRow');
        const boardCol = this.data.get('boardCol');
        const boardWinCondition = this.data.get('boardWinCondition');



        const boardModel = `${boardCol}x${boardRow}_${boardWinCondition}`;
        // Find the first empty cell (value 0) in the board

        let probabilitiesArray: {
            row: number;
            col: number;
            rate: number;
            beforePos: { row: number, col: number } | undefined;
        }[][] = [];

        // Ensure probabilitiesArray[level] exists and initialize if necessary
        while (probabilitiesArray.length <= depth) {
            probabilitiesArray.push([]);
        }

        for (let row = 0; row < boardAsNumbers.length; row++) {
            for (let col = 0; col < boardAsNumbers[row].length; col++) {
                const boardCopy = boardAsNumbers.map(row => row.slice());

                if (boardCopy[row][col] === 0) {

                    boardCopy[row][col] = 2;//2를 넣는다는 가정
                    const prediction = await modelLoader.predict(boardModel, { x: boardCol, y: boardRow }, boardCopy);

                    probabilitiesArray[0].push({
                        col: col,
                        row: row,
                        rate: prediction.probability,
                        beforePos: undefined
                    });

                    //다음 아무칸이나 넣고 순환
                    for (let rowNext = 0; rowNext < boardCopy.length; rowNext++) {
                        for (let colNext = 0; colNext < boardCopy[rowNext].length; colNext++) {
                            const boardCopy2 = boardCopy.map(row => row.slice());
                            if (boardCopy2[rowNext][colNext] === 0) {
                                boardCopy2[rowNext][colNext] = 1;//1를 넣는다는 가정

                                const prediction2 = await modelLoader.predict(boardModel, { x: boardCol, y: boardRow }, boardCopy2);

                                probabilitiesArray[1].push({
                                    col: colNext,
                                    row: rowNext,
                                    rate: prediction2.probability,
                                    beforePos: { row, col }
                                });
                                // const nextLevelProbabilities = await this.boardPickNumberByMarkovDecisionOnMultiDimension(boardCopy2, level + 1);
                            }

                        }
                    }

                }
            }
        }

        let bestCombinedMove = {
            level0: { row: -1, col: -1, rate: -Infinity },
            level1: { row: -1, col: -1, rate: -Infinity },
            combinedRate: -Infinity
        };

        probabilitiesArray[0].forEach(level0Move => {
            probabilitiesArray[1].forEach(level1Move => {
                if (
                    level1Move.beforePos &&
                    level1Move.beforePos.row === level0Move.row &&
                    level1Move.beforePos.col === level0Move.col
                ) {
                    const combinedRate = level0Move.rate + level1Move.rate;
                    if (combinedRate > bestCombinedMove.combinedRate) {
                        bestCombinedMove = {
                            level0: level0Move,
                            level1: level1Move,
                            combinedRate
                        };
                    }
                }
            });
        });

        // console.log(bestCombinedMove.level0, bestCombinedMove.level1, bestCombinedMove.combinedRate);
        return bestCombinedMove;
    }


    private calculateTimeDifference(
        startTime: number,
        endTime: number,
        pad?: { hours?: number, minutes?: number, seconds?: number, milliseconds?: number }
    ): {
        hours: string,
        minutes: string,
        seconds: string,
        milliseconds: string
    } {
        const difference = endTime - startTime;
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        const milliseconds = difference % 1000;

        const padValue = (value: number, pad: number | undefined) =>
            pad ? value.toString().padStart(pad, '0') : value.toString();

        return {
            hours: padValue(hours, pad?.hours),
            minutes: padValue(minutes, pad?.minutes),
            seconds: padValue(seconds, pad?.seconds),
            milliseconds: padValue(milliseconds, pad?.milliseconds)
        };
    }

    private gameStartInit(self: tictactoeExtendsSpecialRules) {

        if (this.firstRun) {
            this.firstRun = false;
            //게임 시작 함수
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
                this.data.values.boardWinCondition = 4;
                self.setWinLength(this.data.get('boardWinCondition'));

                //게임 보드 크기 설정
                this.data.values.boardRow = 4;
                this.data.values.boardCol = 4;
                self.setBoardSize(this.data.get('boardRow'), this.data.get('boardCol'));

                //출력ㅌxxx
                this.showGameConfigToConsole(self);
            });
        } else {
            //이후 초기화는 보드크기, 승리조건만 바뀜. 

            //승리조건
            this.data.values.boardWinCondition = 4;
            self.setWinLength(this.data.get('boardWinCondition'));

            //게임 보드 크기 설정
            this.data.values.boardRow = 4;
            this.data.values.boardCol = 4;
            self.setBoardSize(this.data.get('boardRow'), this.data.get('boardCol'));

            //게임 시작 시 누가 먼저 할 것인가
            self.setCurrentPlayer(self.randomPlayerSelect());
        }


    }

    private formatTime(ms: number | undefined): { formatted: string, ms: number } {
        if (ms === undefined) {
            return { formatted: "00:00", ms: 0 };
        }
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return { formatted: `${minutes}:${seconds}`, ms };
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
        // this.load.aseprite('test_sprite', imageLoader.getImageAsBase64('test_sprite'), imageLoader.getFetchedDataURL('test_sprite'));

        this.load.aseprite('board_border', imageLoader.getImageAsBase64('board_border'), imageLoader.getFetchedDataURL('board_border'));
        this.load.aseprite('board_border_score', imageLoader.getImageAsBase64('board_border_score'), imageLoader.getFetchedDataURL('board_border_score'));
        this.load.aseprite('board_border_log', imageLoader.getImageAsBase64('board_border_log'), imageLoader.getFetchedDataURL('board_border_log'));

        // xo_sprite
        this.load.aseprite('xo_sprite', imageLoader.getImageAsBase64('xo_sprite'), imageLoader.getFetchedDataURL('xo_sprite'));




    }

    async create() {


        const system = this.data.get('boardSystem') as tictactoeExtendsSpecialRules;

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

            const uiGlobalTimeText = (await createText(this, 516, 60, '', { font: '36px Silver', color: '#fafafa', letterSpacing: 4 }, 'Silver')).setOrigin(0, 0.5).setAlpha(0.7);
            const uiSlideTimeText = (await createText(this, 516, 130, '', { font: '36px Silver', color: '#fafafa', letterSpacing: 4 }, 'Silver')).setOrigin(0, 0.5).setAlpha(0.7);
            const uiExtendTimeText = (await createText(this, 596, 130, '', { font: '24px Silver', color: '#fafafa', letterSpacing: 2 }, 'Silver')).setOrigin(0, 0.5).setAlpha(0.7);
            const uiLogText = (await createText(this, 520, 290, '', { font: '24px Silver', color: '#fafafa', letterSpacing: 1, lineSpacing: 2 }, 'Silver')).setOrigin(0, 0).setAlpha(0.7);
            const uiScorePrefixText = (await createText(this, 0, 0, '', { font: '48px Silver', color: '#fafafa', letterSpacing: 4 }, 'Silver')).setOrigin(0, 0.5);
            const uiScoreValueText = (await createText(this, 0, 0, '', { font: '36px Silver', color: '#fafafa', letterSpacing: 2 }, 'Silver')).setOrigin(0, 0.5);

            uiGameContainer.add(
                [
                    ...[
                        uiTestRect1,
                        uiTestRect2,
                        uiTestRect3,
                        uiTestRect4,
                        uiTestRect5
                    ],
                    ...[
                        uiGlobalTimeText,
                        uiSlideTimeText,
                        uiExtendTimeText,
                        uiLogText,
                        uiScorePrefixText,
                        uiScoreValueText
                    ],
                    uiBoardBorder, uiScorePrefixText, uiScoreValueText
                ]
            );




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

            const layer_gameBoard = createLayerContainer(this, 'layer_globalContainer', { w: 400, h: 500 }, 0, 3, 3);
            const winLineGraphics = this.add.graphics();
            winLineGraphics.lineStyle(5, 0xff0000, 0.4);

            // 레이어들을 게임 컨테이너에 추가
            gameContainer.add([layer_gameBoard, winLineGraphics]);




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


            const renderUI = () => {

                {
                    const globalTime = this.calculateTimeDifference(Date.now() - this.data.get('globalTime'), this.data.get('gameGlobalStartTime'), { minutes: 2, seconds: 2 });
                    const slideTime = this.formatTime(this.data.get('slideTime'));
                    uiGlobalTimeText.setText(`${globalTime.minutes}:${globalTime.seconds}`);
                    uiSlideTimeText.setText(slideTime.formatted);
                    uiExtendTimeText.setText(`- ${slideTime.ms}`);
                }


                uiLogText.setText(this.data.get('logArray'));
                uiScorePrefixText.setText('SCORE');
                uiScoreValueText.setText(this.data.get('globalScore').toString());
            }

            const renderWiningLine = (pattern?: [number, number][]) => {
                winLineGraphics.clear();
                if (pattern != undefined) {
                    pattern.forEach((point, index) => {
                        const cellBounds = layer_gameBoard.getCellBoundsByPos(point[0], point[1]);
                        if (cellBounds) {

                            const w = Math.floor(cellBounds.topRight.x - cellBounds.topLeft.x);
                            const h = Math.floor(cellBounds.bottomLeft.y - cellBounds.topLeft.y);

                            // 중앙 좌표 계산
                            const centerX = cellBounds.topLeft.x + (w) - gameContainer.x;
                            const centerY = cellBounds.topLeft.y + (h) - 10 - gameContainer.y;

                            // 선 그리기
                            if (index === 0) {
                                winLineGraphics.moveTo(centerX, centerY);
                            } else {
                                winLineGraphics.lineTo(centerX, centerY);
                            }
                        }
                    });
                    winLineGraphics.strokePath();
                }
            }


            const renderBoard = () => {
                layer_gameBoard.clearAllObjects();
                system.getBoard().forEach((row, y) => {
                    const nextRoundGo = () => {
                        this.nextRound();
                        this.gameStartInit(system);
                        renderUI();
                        renderBoard();
                    }
                    row.forEach((tile, x) => {
                        var btn: Phaser.GameObjects.Sprite | undefined = undefined;

                        if (tile == '2') {
                            btn = createAnimatedButton(this, 0, 0, 'O_ANIMATION', 'O_ANIMATION', () => {

                            }).setOrigin(0.5, 0.5);
                        } else if (tile == '1') {
                            btn = createAnimatedButton(this, 0, 0, 'X_ANIMATION', 'X_ANIMATION', () => {

                            }).setOrigin(0.5, 0.5);
                        } else {

                            btn = createAnimatedButton(this, 0, 0, 'EMPTY_ANIMATION', 'EMPTY_ANIMATION', async () => {
                                console.log('Click:', x, y);
                                system.makeMove(y, x);


                                renderBoard();
                                renderUI();

                                const check = system.checkWinner();
                                renderWiningLine(check.pattern);

                                console.log('xxxxx', check);

                                if (check.type == 'tile') {

                                    console.log('Winner:', check.value);

                                    setTimeout(() => {
                                        winLineGraphics.clear();
                                        nextRoundGo();
                                    }, 500);
                                } else if (check.type == 'status' && check.value == TictactoeGameStatus.DRAW) {
                                    setTimeout(() => {
                                        winLineGraphics.clear();
                                        nextRoundGo();
                                    }, 500);
                                } else if (check.type == 'status' && check.value == TictactoeGameStatus.PLAYING) {
                                    const boardRow = this.data.get('boardRow');
                                    const boardCol = this.data.get('boardCol');
                                    const boardWinCondition = this.data.get('boardWinCondition');

                                    const result = await this.boardPickNumberByMarkovDecisionOnMultiDimension(system.getBoardAsNumbers());

                                        system.makeMove(result.level0.row, result.level0.col);

                                        const check = system.checkWinner();
                                        console.log('asasas',check);
                                        renderBoard();
                                        renderUI();

                                        if (check.type == 'status' && check.value == TictactoeGameStatus.DRAW) {
                                            setTimeout(() => {
                                                winLineGraphics.clear();
                                                nextRoundGo();
                                            }, 500);
                                        }

                                    // modelLoader.predict(`${boardCol}x${boardRow}_${boardWinCondition}`, { x: boardCol, y: boardRow }, system.getBoardAsNumbers()).then((result) => {
                                    //     const aiMoveX = result % boardCol;
                                    //     const aiMoveY = Math.floor(result / boardRow);

                                    //     system.makeMove(aiMoveY, aiMoveX);
                                    //     console.log('AI Result:', result, aiMoveY, aiMoveX);
                                    //     const check = system.checkWinner();
                                    //     console.log('asasas',check);
                                    //     renderBoard();
                                    //     renderUI();

                                    //     if (check.type == 'status' && check.value == TictactoeGameStatus.DRAW) {
                                    //         setTimeout(() => {
                                    //             winLineGraphics.clear();
                                    //             nextRoundGo();
                                    //         }, 500);
                                    //     }
                                    // });
                                }




                            }).setOrigin(0.5, 0.5);
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

            this.registry.set('renderUI', renderUI);



            //정지 하면 나오는 화면
            //환경설정 및 이어하기, 그만하기 버튼 존재
            // const pauseScreenContainer = this.add.container(0, 0);


            system.gameStart(async (self) => {

                this.gameStartInit(self);
                renderUI();
                renderBoard();
            });

        }



        //화면을 랜더링 함
        sceneGameDone();
        sceneGaming();
    }

    update() {
        // 매 프레임마다 실행되는 코드
        const uiRender = this.registry.get('renderUI');
        if (uiRender) uiRender();
    }
}
