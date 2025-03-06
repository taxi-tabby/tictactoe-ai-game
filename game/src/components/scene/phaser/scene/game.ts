import { tictactoeExtendsSpecialRules } from "../../../../schema/classes/tictactoeExtendsSpecialRules";

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    private gameStartInit(self: tictactoeExtendsSpecialRules) {
        console.log("Board Configuration:", self.getBoard());
        console.log("Controller:", self.getController());
        console.log("Current Player:", self.getCurrentPlayer());
        console.log("Board Size:", self.mapSizeX.value, 'x' ,self.mapSizeY.value);
    }

    private showGameConfigToConsole(self: tictactoeExtendsSpecialRules) {
        console.log("Board Configuration:", self.getBoard());
        console.log("Controller:", self.getController());
        console.log("Current Player:", self.getCurrentPlayer());
        console.log("Board Size:", self.mapSizeX.value, 'x' ,self.mapSizeY.value);
    }



    preload() {

    }

    create() {
        // this.sys.game.
        const audioLoader = this.registry.get('audioLoader');
        const imageLoader = this.registry.get('imageLoader');
        const modelLoader = this.registry.get('modelLoader');

        const system = new tictactoeExtendsSpecialRules();



        system.gameStart((self) => {
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
                });
            }
            }
        };

        drawBoard(system);

        const showPlayerInfo = (self: tictactoeExtendsSpecialRules) => {
            const currentPlayer = self.getCurrentPlayer();
            const controller = self.getController();

            this.add.text(10, (3 * 100) + 20, `Now turn: ${currentPlayer}`, {
                fontSize: '24px',
                color: '#ffffff'
            });

            this.add.text(10, (3 * 100) + 50, `You: ${controller}`, {
                fontSize: '24px',
                color: '#ffffff'
            });
        };

        showPlayerInfo(system);
        
    }

    update() {
        // 매 프레임마다 실행되는 코드
    }
}
