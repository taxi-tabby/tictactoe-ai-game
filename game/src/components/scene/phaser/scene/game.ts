import { TictactoeGameStatus } from "../../../../schema/classes/tictactoe";
import { tictactoeExtendsSpecialRules } from "../../../../schema/classes/tictactoeExtendsSpecialRules";
import { TicTacToeAI } from '../../../../schema/classes/model';
import { AudioManager } from '../../../../schema/classes/audio';
import { ImageLoader } from '../../../../schema/classes/image';
import { createTextButton } from "../helper/create/textButton";
import { createButton } from "../helper/create/button";
import createLayerContainer from "../helper/create/layerContainer";

export class GameScene extends Phaser.Scene {



    constructor() {
        super({ key: 'GameScene' });
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
            self.setBoardSize(5, 5);

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
        const modelLoader = this.registry.get('modelLoader');


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

    create() {

 
        const system = new tictactoeExtendsSpecialRules();

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


            const layerContainer = createLayerContainer(this, 'myLayer');

            const pause1Btn = createTextButton(this, 0, 0, 'PAUSE', () => {
            }, {font: '60px SilverFont'});

            const pause2Btn = createTextButton(this, 0, 0, 'PAUSE', () => {
                alert('test');
            }, {font: '60px SilverFont'});



            layerContainer.addToGrid(pause1Btn, 0, 0);
            layerContainer.addToGrid(pause2Btn, 5, 5);


            // y12에 0~12까지 1초마다 버튼 하나씩 추가
            for (let i = 0; i <= 12; i++) {
                setTimeout(() => {
                    const testBtn = createButton(this, 0, 0, {key: 'test_sprite', frame: 'sprite_3'}, {key: 'test_sprite', frame: 'sprite_16'}, () => {
                        alert('test');
                    }, 1);
                    testBtn.scale = 4;
                    layerContainer.addToGrid(testBtn, i, 12);
                    layerContainer.layoutGrid();

                    console.log(`Cell x${i}, y12:`);
                    console.log('Cell Size:', layerContainer.getCellSize());
                    console.log('Button Bounds:', testBtn.getBounds());
                    console.log('Object Bounds:', layerContainer.getBoundsOfObject(testBtn));
                    console.log('Cell Bounds:', layerContainer.getCellBounds(i, 12));

                }, i * 1000);
            }


                // console.log(layerContainer.getCellSize());
                // console.log(testBtn.getBounds());
                // console.log(layerContainer.getBoundsOfObject(testBtn));
                // console.log(layerContainer.getCellBounds(12, 12));

            
            uiPauseContainer.add([layerContainer]);



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
                gameStartCountDownContainer
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

            system.gameStart((self) => {
                this.gameStartInit(self);
            });

        }



        //최초에는 게임 진행
        sceneGaming();
    }

    update() {
        // 매 프레임마다 실행되는 코드
    }
}
