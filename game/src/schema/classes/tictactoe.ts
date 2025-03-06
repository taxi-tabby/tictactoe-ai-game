import { BoardGame } from "../boardGame";
import type { TileValue } from "../boardGame";
import VariableGetSet from "../getset";
class tictactoeGameBehavior extends BoardGame {

    constructor() {
        super(3, 3);
    }

    whoNext(): TileValue {
        let next: TileValue = BoardGame.Tile.EMPTY;
        if (this.currentPlayer === BoardGame.Tile.X) {
            next = BoardGame.Tile.O;
        } else if (this.currentPlayer === BoardGame.Tile.O) {
            next = BoardGame.Tile.X;
        }

        return next;
    }


    private winLength: VariableGetSet<number> = new VariableGetSet<number>(3);

    makeMove(row: number, col: number): boolean {

        const whoNext = this.whoNext();

        if (this.board.value[row][col] !== BoardGame.Tile.EMPTY) {
            return false; // 이미 타일이 존재하는 경우
        }

        this.board.value[row][col] = this.currentPlayer;
        
        

        
        
        return true;
    }



    getWinLength(): number {
        return this.winLength.value;
    }

    setWinLength(length: number): void {
        if (length > 0) {
            this.winLength.value = length;
        } else {
            throw new Error("winLength must be a positive number.");
        }
    }




    // tic tac toe 게임에서의 승자를 확인하는 메서드
    public checkWinner(): TileValue {
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
                return this.board.value[a[0]][a[1]];
            }
        }

        // 무승부 확인
        const isDraw = this.board.value.every(row => row.every(cell => cell !== 0));
        if (isDraw) {
            return BoardGame.Tile.EMPTY; // 무승부
        }

        return BoardGame.Tile.NOT; // 아직 승자가 없음
    }

}

export { tictactoeGameBehavior };
