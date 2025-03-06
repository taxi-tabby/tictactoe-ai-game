import { BoardGame } from "../boardGame";
import type { boardActionDenied, TileValue } from "../boardGame";
import VariableGetSet from "../getset";


/**
 * 틱텍토 게임 상태
 */
enum TictactoeGameStatus {
    PLAYING,
    DRAW,
    PAUSE
}



/**
 * 틱텍토 게임 클래스
 */
class tictactoeGameBehavior extends BoardGame {

    constructor() {

        //보드게임 생성
        super(0, 0);
        // this.setBoardSize(3, 3);

        //플레이어 타일
        this.addTile('O', 1); //플레이어1
        this.addTile('X', 2); //플레이어2

        //조작 대상
        this.whoAreYou = new VariableGetSet<TileValue | undefined>(undefined);

    }

    whoNext(): TileValue {
        let next: TileValue = this.tile('EMPTY');
        if (this.currentPlayer.value === this.tile('X')) {
            next = this.tile('O');
        } else if (this.currentPlayer.value === this.tile('O')) {
            next = this.tile('X');
        }
        return next;
    }


    setCurrentPlayer(player: TileValue): void {
        if (player === BoardGame.Tile.X || player === BoardGame.Tile.O || player === BoardGame.Tile.EMPTY) {
            this.currentPlayer.value = player;
        } else {
            throw new Error("Invalid player value");
        }
    }

    makeMove(row: number, col: number): boardActionDenied {
        const whoNext = this.whoNext();

        if (this.board.value[row][col] !== this.tile('EMPTY')) {
            return {moved:false, reason: 'Tile already exists'} ; // 이미 타일이 존재하는 경우
        }

        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer === this.tile('EMPTY')) {
            return {moved: false, reason: 'Player not selected'}; // 현재 플레이어가 없는 경우
        }

        //입력
        this.board.value[row][col] = currentPlayer;
        this.addBoardHistoryItem({
            row: row,
            col: col,
            currentPlayer: currentPlayer,
            whichTile: currentPlayer, // 플레이어 타일과 플레이어가 보드에 둔 타일의 정의가 동일함.
            board: this.deepCopy(this.board.value),
        });

        

        const check = this.checkWinner();

        if (check.type === 'status') {
            switch (check.value) {
                case TictactoeGameStatus.DRAW:
                    this.addGlobalBoardHistoryItem({
                        winner: this.tile('EMPTY'),
                        histroy: this.deepCopy(this.boardHistory.value),
                    });
                    this.resetBoardHistory();
                    return {moved: true, reason: 'Draw'};
            }
        } else {
            switch (check.value) {
                case this.tile('X'):
                    this.addGlobalBoardHistoryItem({
                        winner: check.value,
                        histroy: this.deepCopy(this.boardHistory.value),
                    });
                    this.resetBoardHistory();
                    return {moved: true, reason: 'Player X wins'};
                case this.tile('O'):
                    this.addGlobalBoardHistoryItem({
                        winner: check.value,
                        histroy: this.deepCopy(this.boardHistory.value),
                    });
                    this.resetBoardHistory();
                    return {moved: true, reason: 'Player O wins'};
            }
        }
        


        //플레이어 전환
        this.switchPlayer(whoNext);
        return {moved: true};
    }

    // tic tac toe 게임에서의 승자를 확인하는 메서드
    public checkWinner(): {value: TictactoeGameStatus | TileValue, type: 'status' | 'tile'} {
        const boardSize = { rows: this.board.value.length, cols: this.board.value[0].length };

        const winLength = this.getWinLength();

        const winPatterns = [];
        // 가로 승리 패턴 생성
        for (let r = 0; r < boardSize.rows; r++) {
            for (let c = 0; c <= boardSize.cols - winLength; c++) {
                const pattern = [];
                for (let i = 0; i < winLength; i++) {
                    pattern.push([r, c + i]);
                }
                winPatterns.push(pattern);
            }
        }

        // 세로 승리 패턴 생성
        for (let c = 0; c < boardSize.cols; c++) {
            for (let r = 0; r <= boardSize.rows - winLength; r++) {
                const pattern = [];
                for (let i = 0; i < winLength; i++) {
                    pattern.push([r + i, c]);
                }
                winPatterns.push(pattern);
            }
        }

        // 대각선 (왼쪽 위에서 오른쪽 아래) 승리 패턴 생성
        for (let r = 0; r <= boardSize.rows - winLength; r++) {
            for (let c = 0; c <= boardSize.cols - winLength; c++) {
                const pattern = [];
                for (let i = 0; i < winLength; i++) {
                    pattern.push([r + i, c + i]);
                }
                winPatterns.push(pattern);
            }
        }

        // 대각선 (왼쪽 아래에서 오른쪽 위) 승리 패턴 생성
        for (let r = winLength - 1; r < boardSize.rows; r++) {
            for (let c = 0; c <= boardSize.cols - winLength; c++) {
                const pattern = [];
                for (let i = 0; i < winLength; i++) {
                    pattern.push([r - i, c + i]);
                }
                winPatterns.push(pattern);
            }
        }

        // 승리 패턴 확인
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board.value[a[0]][a[1]] && pattern.every(([x, y]) => this.board.value[x][y] === this.board.value[a[0]][a[1]])) {
                return {type: 'tile', value: this.board.value[a[0]][a[1]]};
            }
        }

        // 무승부 확인
        const isDraw = this.board.value.every(row => row.every(cell => cell !== this.tile('EMPTY')));
        if (isDraw) {
            return {type: 'status', value: TictactoeGameStatus.DRAW}; // 무승부
        }

        return {type: 'status', value: TictactoeGameStatus.PLAYING}; // 게임 중
    }

    /**
     * 승리 조건 길이
     */
    private winLength: VariableGetSet<number> = new VariableGetSet<number>(3);

    /**
     * 승리조건 길이 선택
     * @returns 승리 조건 길이 정수
     */
    getWinLength(): number {
        return this.winLength.value;
    }

    /**
     * 승리조건 길이 설정
     * @param length 승리 조건 길이 
     */
    setWinLength(length: number): void {
        if (length > 0) {
            this.winLength.value = length;
        } else {
            throw new Error("winLength must be a positive number.");
        }
    }


    /**
     * 해당 화면에서 당신이 조작하는 타일이 무엇인지 확인
     */
    private whoAreYou: VariableGetSet<TileValue | undefined>;


    /**
     * 조종자를 선택하는 메서드
     * @param controller 조종자 타일 값
     */
    setController(controller: TileValue | undefined): void {
        if (controller === this.tile('X') || controller === this.tile('O') || controller === undefined) {
            this.whoAreYou.value = controller;
        } else {
            throw new Error("Invalid controller value");
        }
    }

    /**
     * 현재 조종자가 누구인지 확인하는 메서드
     * @returns 조종자 타일 값
     */
    getController(): TileValue | undefined {
        return this.whoAreYou.value;
    }



    /**
     * 50% 확률로 플레이어를 선택
     * - 주의 직접 스위치를 해야 함
     * @returns 
     */
    randomPlayerSelect(): TileValue {
        return Math.random() > 0.5 ? this.tile('X') : this.tile('O');
    }


    /**
     * 게임 시작
     */
    gameStart(starter: (self: this) => void): void {



        starter(this);

    }


}

export { tictactoeGameBehavior };