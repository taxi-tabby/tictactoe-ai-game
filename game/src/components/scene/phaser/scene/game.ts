import { TictactoeGameStatus } from "../../../../schema/classes/tictactoe";
import { tictactoeExtendsSpecialRules } from "../../../../schema/classes/tictactoeExtendsSpecialRules";
import { TicTacToeAI } from '../../../../schema/classes/model';
import { AudioManager } from '../../../../schema/classes/audio';
import { ImageLoader } from '../../../../schema/classes/image';
import { createTextButton } from "../helper/create/textButton";
import { createButton } from "../helper/create/button";
import createLayerContainer, { GridLayout } from "../helper/create/layerContainer";
import { model } from "@tensorflow/tfjs";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { calcGridPercent } from "../../../../schema/classes/math";

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
            self.setBoardSize(3, 3);

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


    preload() {
        console.clear();

        const audioLoader = this.registry.get('audioLoader');
        const imageLoader = this.registry.get('imageLoader') as ImageLoader;

        this.load.image('particle', imageLoader.getImageAsBase64('repo_wolf'));
        this.load.image('main_bg_1', imageLoader.getImageAsBase64('main_bg_1'));
        this.load.aseprite('test_sprite', imageLoader.getImageAsBase64('test_sprite'), imageLoader.getFetchedDataURL('test_sprite'));

        const font = new FontFace('SilverFont', 'url(./game/asset/itch/font/Silver.ttf)');
        font.load().then(function (loadedFont) {
            document.fonts.add(loadedFont); // 폰트를 웹 폰트로 추가
            console.log('폰트 로드 완료!');
        }).catch(function (error) {
            console.error('폰트 로딩 실패:', error);
        });


    }

    async create() {


        const system = new tictactoeExtendsSpecialRules();

        const modelLoader = this.registry.get('modelLoader') as TicTacToeAI;


        const sceneGameDone = () => {
            this.clearScene();
            this.add.text(10, 10, 'Game Over', {
                fontSize: '32px',
                color: '000'
            });
            const restartButton = this.add.text(10, 50, 'Restart Game', {
                fontSize: '32px',
                color: '#ff0000'
            }).setInteractive({ useHandCursor: true });
            restartButton.on('pointerdown', () => {
                sceneGaming();
            });
        }

        const sceneGaming = () => {
            this.clearScene();

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


            //컨테이너 그리드 
            const gridSize = {
                x: 24,
                y: 24
            };

            const layer_globalContainer = createLayerContainer(this, 'globalGridLayer', 0, gridSize.x, gridSize.y);
            const layer_gameContainer = createLayerContainer(this, 'layer_gameContainer');
            const layer_infoContainer = createLayerContainer(this, 'layer_infoContainer');


            const grid_TopPadding = this.add.graphics().setName('graphic_TopPadding');
            const grid_BottomPadding = this.add.graphics().setName('graphic_BottomPadding');
            const grid_LeftPadding = this.add.graphics().setName('graphic_LeftPadding');
            const grid_RightPadding = this.add.graphics().setName('graphic_RightPadding');



            const grid_gameSectionRect = this.add.graphics().setName('graphic_gameSectionRect');
            const grid_gameBoardRect = this.add.graphics().setName('grid_gameBoardRect');


            const grid_infoSectionRect = this.add.graphics().setName('graphic_infoSectionRect');

 

            //상단 공백백
            layer_globalContainer.addToGrid(grid_TopPadding, 0, 0, {callbackRenderUpdate: (object: Phaser.GameObjects.Graphics) => {
                const bounds = layer_globalContainer.getCellBoundsByObject(object);
                if (bounds !== null) {
                    const w = bounds.topRight.x - bounds.topLeft.x;
                    const h = bounds.bottomLeft.y - bounds.topLeft.y;

                    object.clear();
                    object.fillStyle(0xff00ff, 0.3);
                    object.fillRect(bounds.topLeft.x, bounds.topLeft.y, w * gridSize.x, h);
                };
            }});

            //하단 공백
            layer_globalContainer.addToGrid(grid_BottomPadding, 0, (gridSize.y - 1), {callbackRenderUpdate: (object: Phaser.GameObjects.Graphics) => {
                const bounds = layer_globalContainer.getCellBoundsByObject(object);
                if (bounds !== null) {
                    const w = bounds.topRight.x - bounds.topLeft.x;
                    const h = bounds.bottomLeft.y - bounds.topLeft.y;

                    object.clear();

                    object.fillStyle(0xff00ff, 0.3);
                    object.fillRect(bounds.topLeft.x, bounds.topLeft.y, w * gridSize.x, h);
                };
            }});

            //좌측 공백
            layer_globalContainer.addToGrid(grid_LeftPadding, 0, 1, {callbackRenderUpdate: (object: Phaser.GameObjects.Graphics) => {
                const bounds = layer_globalContainer.getCellBoundsByObject(object);
                if (bounds !== null) {
                    const w = bounds.topRight.x - bounds.topLeft.x;
                    const h = bounds.bottomLeft.y - bounds.topLeft.y;

                    object.clear();

                    object.fillStyle(0xff00ff, 0.2);
                    object.fillRect(bounds.topLeft.x, bounds.topLeft.y, w, h * (gridSize.y - 2));
                };
            }});

            //우측 공백
            layer_globalContainer.addToGrid(grid_RightPadding, (gridSize.x - 1), 1, {callbackRenderUpdate: (object: Phaser.GameObjects.Graphics) => {
                const bounds = layer_globalContainer.getCellBoundsByObject(object);
                if (bounds !== null) {
                    const w = bounds.topRight.x - bounds.topLeft.x;
                    const h = bounds.bottomLeft.y - bounds.topLeft.y;

                    object.clear();
                    object.fillStyle(0xff00ff, 0.2);
                    object.fillRect(bounds.topLeft.x, bounds.topLeft.y, w, h * (gridSize.y - 2));
                };
            }});


            //게임 영역
            layer_globalContainer.addToGrid(layer_gameContainer, 1, 1, { callbackHierarchicalCreate: (parentAny, selfAny) => {

                const parent = parentAny as GridLayout;
                const self = selfAny as GridLayout;
                const bounds = parent.getCellBoundsByObject(self);
                if (bounds == null) return;
                
                console.log(parent.name, self.name)

                // self.runHierarchicalEvent();

                const w = bounds.topRight.x - bounds.topLeft.x;
                const h = bounds.bottomLeft.y - bounds.topLeft.y;

                //게임 영역을 표시하는 사각형
                self.addToGrid(grid_gameSectionRect, 0, 0, {callbackRenderUpdate: (gameObject) => {
                    const rect = gameObject as Phaser.GameObjects.Graphics;
                    rect.clear();
                    rect.fillStyle(0x00ff00, 0.5);
                    rect.fillRect(bounds.topLeft.x, bounds.topLeft.y, calcGridPercent(w, gridSize.x, 40), h * (gridSize.y - 2));
                }});

                //게임 영역 안에서 게임 보드를 표시하는 사각형
                self.addToGrid(grid_gameBoardRect, 1, 1, {callbackRenderUpdate: (gameObject) => {
                    const rect = gameObject as Phaser.GameObjects.Graphics;
                    const bounds = self.getCellBoundsByObject(rect);
                    if (bounds == null) return;
                    const w = bounds.topRight.x - bounds.topLeft.x;
                    const h = bounds.bottomLeft.y - bounds.topLeft.y;
                    rect.clear();
                    rect.fillStyle(0xff0000, 0.6);
                    rect.fillRect(bounds.topLeft.x, bounds.topLeft.y, w, h);
                }});


                self.layoutGrid();
            }});

            //정보 영역
            layer_globalContainer.addToGrid(layer_infoContainer, 1, 1, {callbackHierarchicalCreate: (parentAny, selfAny) => {
                const parent = parentAny as GridLayout;
                const self = selfAny as GridLayout;
                const bounds = parent.getCellBoundsByObject(self);
                if (bounds == null) return;


                

                const w = bounds.topRight.x - bounds.topLeft.x;
                const h = bounds.bottomLeft.y - bounds.topLeft.y;


                self.addToGrid(grid_infoSectionRect, 0, 0, {callbackRenderUpdate: (gameObject) => {
                    const rect = gameObject as Phaser.GameObjects.Graphics;

                    //-1은 앞 영역의 계산만큼을 계산하기 위해
                    const nextXPos = w + (calcGridPercent(w, gridSize.x - 1 , 40));

                    //-2는 다음 그리드기 때문
                    const nextWidth = (calcGridPercent(w, gridSize.x - 2 , 100) - calcGridPercent(w, gridSize.x , 40));


                    rect.clear();
                    rect.fillStyle(0xf5f0f0, 0.5);
                    rect.fillRect(nextXPos, bounds.topLeft.y, nextWidth, h * (gridSize.y - 2));
                }});


                self.layoutGrid();
            }});


        
            



            //하위 생성 이벤트
            layer_globalContainer.runHierarchicalEvent(layer_gameContainer);
            layer_globalContainer.runHierarchicalEvent(layer_infoContainer);
            
            //위치 업데이트
            layer_globalContainer.layoutGrid();





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
                layer_globalContainer,
            ]);

            // 컨테이너 깊이 설정
            layer_globalContainer.setDepth(0);
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
            



            //정지 하면 나오는 화면
            //환경설정 및 이어하기, 그만하기 버튼 존재
            // const pauseScreenContainer = this.add.container(0, 0);






            // const move = self.makeMove(y, x);
            // if (!move.moved) {
            //     console.log(`${move.reason}`);
            //     return;
            // }
            // const check = self.checkWinner();
            // if (check.type === 'tile') {
            //     console.log(`Winner: ${check.value}`);
            //     return;
            // } else if (check.type === 'status' && check.value === TictactoeGameStatus.DRAW) {
            //     console.log(`Draw!`);
            //     return;
            // }

            system.gameStart(async (self) => {
                this.gameStartInit(self);


                const pre = await modelLoader.predict('4x4_4', { x: 4, y: 4 }, [
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 1, 0],
                    [0, 0, 0, 0],
                ]);
                console.log('AI Prediction:', pre);


            });

        }



        //최초에는 게임 진행
        sceneGaming();
    }

    update() {
        // 매 프레임마다 실행되는 코드
    }
}
