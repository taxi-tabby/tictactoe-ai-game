import { TictactoeGameStatus } from "../../../../schema/classes/tictactoe";
import { tictactoeExtendsSpecialRules } from "../../../../schema/classes/tictactoeExtendsSpecialRules";
import { TicTacToeAI } from '../../../../schema/classes/model';
import { AudioManager } from '../../../../schema/classes/audio';
import { ImageLoader } from '../../../../schema/classes/image';
import { createTextButton } from "../helper/create/textButton";
import { createButton } from "../helper/create/button";
import createLayerContainer from "../helper/create/layerContainer";
import { model } from "@tensorflow/tfjs";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

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

            console.log(this.rexUI.add.sizer({}));

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



            const layerContainer = this.add.container(0, 0);
            //컨테이너 그리드 
            // const layerContainer = createLayerContainer(this, 'globalGrid', 0, 3, 3);

            // const grid_TopPadding = this.add.graphics();
            // const grid_BottomPadding = this.add.graphics();

            // layerContainer.addToGrid(grid_TopPadding, 0, 0, {callbackRenderUpdate: (object: Phaser.GameObjects.Graphics) => {
            //     //크기 구해서 랜더링 시 영역 갱신처리
            //     const bounds = layerContainer.getCellBoundsByObject(object);
            //     if (bounds !== null) {
            //         const w = bounds.topRight.x - bounds.topLeft.x;
            //         const h = bounds.bottomLeft.y - bounds.topLeft.y;
                    
            //         object.clear();
            //         const randomColor = Phaser.Display.Color.RandomRGB();
            //         object.fillStyle(randomColor.color, 0.1);
            //         object.fillRect(bounds.topLeft.x, bounds.topLeft.y, w * 3, h);
            //     };
            // }});
            // layerContainer.setGridSizeByObject(grid_TopPadding, {height: 20});

            // layerContainer.addToGrid(grid_BottomPadding, 0, 2, {callbackRenderUpdate: (object: Phaser.GameObjects.Graphics) => {
            //     //크기 구해서 랜더링 시 영역 갱신처리
            //     const bounds = layerContainer.getCellBoundsByObject(object);
            //     if (bounds !== null) {
            //         const w = bounds.topRight.x - bounds.topLeft.x;
            //         const h = bounds.bottomLeft.y - bounds.topLeft.y;
                    
            //         object.clear();
            //         const randomColor = Phaser.Display.Color.RandomRGB();
            //         object.fillStyle(randomColor.color, 0.1);
            //         object.fillRect(bounds.topLeft.x, bounds.topLeft.y, w * 3, h);
            //     };
            // }});
            // layerContainer.setGridSizeByObject(grid_BottomPadding, {height: 20});


            // layerContainer.layoutGrid();







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
                layerContainer,
            ]);

            // 컨테이너 깊이 설정
            backgroundContainer.setDepth(0);
            gameContainer.setDepth(1);
            scapeParticleContainer.setDepth(2);
            tileParticleContainer.setDepth(3);
            foregroundContainer.setDepth(4);
            foregroundEffectContainer.setDepth(5);
            uiGlobalTimerContainer.setDepth(6);
            uiSlideTimerContainer.setDepth(7);
            gameStartCountDownContainer.setDepth(8);
            uiPauseContainer.setDepth(9);
            layerContainer.setDepth(10);



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
                

                    const pre = await modelLoader.predict('4x4_4', {x: 4, y: 4}, [
                        [0,0,0,0],
                        [0,0,0,0],
                        [0,0,1,0],
                        [0,0,0,0],
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
