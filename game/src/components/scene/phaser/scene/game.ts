import { TictactoeGameStatus } from "../../../../schema/classes/tictactoe";
import { tictactoeExtendsSpecialRules } from "../../../../schema/classes/tictactoeExtendsSpecialRules";

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

    }

    create() {
        // this.sys.game.
        const audioLoader = this.registry.get('audioLoader');
        const imageLoader = this.registry.get('imageLoader');
        const modelLoader = this.registry.get('modelLoader');

        const system = new tictactoeExtendsSpecialRules();


        const sceneGameDone = () => {
            this.clearScene();
            this.add.text(10, 10, 'Game Over', {
                fontSize: '32px',
                color: '#ffffff'
            });
            const restartButton = this.add.text(10, 50, 'Restart Game', {
                fontSize: '32px',
                color: '#ff0000'
            }).setInteractive({ useHandCursor: true });

            restartButton.on('pointerdown', () => {
                this.scene.restart();
            });
        }

        const sceneGaming = () => {
            const drawBoard = (self: tictactoeExtendsSpecialRules) => {
                const board = self.getBoard();
                const boardSizeX = self.mapSizeX.value;
                const boardSizeY = self.mapSizeY.value;

                for (let y = 0; y < boardSizeY; y++) {
                    for (let x = 0; x < boardSizeX; x++) {
                        const tile = board[y][x];
                        const tileText = this.add.text(x * 100, y * 100, tile.toString(), {
                            fontSize: '32px',
                            color: '#fafafa'
                        });

                        tileText.setInteractive({ useHandCursor: true });
                        tileText.on('pointerdown', () => {
                            console.log(`Tile clicked at position (${x}, ${y}) with value: ${tile}`);

                            const move = self.makeMove(y, x);

                            if (!move.moved) {
                                console.log(`${move.reason}`);
                                return;
                            }


                            const check = self.checkWinner();
                            console.log(check);
                            if (check.type === 'tile') {
                                console.log(`Winner: ${check.value}`);
                                sceneGameDone();
                                return;
                            } else if (check.type === 'status' && check.value === TictactoeGameStatus.DRAW) {
                                console.log(`Draw!`);
                                sceneGameDone();
                                return;
                            }


                            this.clearScene();
                            drawBoard(system);
                            showPlayerInfo(system);

                        });
                    }
                }
            };

            const showPlayerInfo = (self: tictactoeExtendsSpecialRules) => {
                const currentPlayer = self.getCurrentPlayer();
                const controller = self.getController();

                const boardSizeY = self.mapSizeY.value;

                this.add.text(10, (boardSizeY * 90) + 20, `Now turn: ${currentPlayer}`, {
                    fontSize: '24px',
                    color: '#ffffff'
                });

                this.add.text(10, (boardSizeY * 90) + 50, `You: ${controller}`, {
                    fontSize: '24px',
                    color: '#ffffff'
                });

                this.add.text(10, (boardSizeY * 90) + 100, `It has been in development as phaser since 03.06.25`, {
                    fontSize: '24px',
                    color: '#ffffff'
                });
            };


            system.gameStart((self) => {
                this.gameStartInit(self);
                this.clearScene();
                drawBoard(system);
                showPlayerInfo(system);
            });

        }


        //최초에는 게임 진행
        sceneGaming();


    }

    update() {
        // 매 프레임마다 실행되는 코드
    }
}
