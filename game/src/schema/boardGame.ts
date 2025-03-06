import VariableGetSet from "./getset";

type TileValue = typeof BoardGame.Tile[keyof typeof BoardGame.Tile];


type boardHistoryItem = {
    board: Array<Array<TileValue>>,
    col: number;
    row: number;
    currentPlayer: TileValue;
    whichTile: TileValue;
}

abstract class BoardGame {

    public static Tile = {
        X: 1,
        O: -1,
        EMPTY: 0,
        NOT: 2
    };

    /**
     * @description currentPlayer 현재 플레이어
     */
    protected currentPlayer: TileValue;

    /**
     * @description board 게임 보드
     */
    protected board: VariableGetSet<Array<Array<TileValue>>>;

    /**
     * @description boardHistory 게임 보드 히스토리
     */
    protected boardHistory: VariableGetSet<boardHistoryItem[]>;

    constructor(rows: number, cols: number) {
        this.board = new VariableGetSet(Array.from({ length: rows }, () => Array(cols).fill(BoardGame.Tile.EMPTY)));
        this.boardHistory = new VariableGetSet([]);
        this.currentPlayer = BoardGame.Tile.EMPTY; // 초기에는 플레이어가 설정되지 않음
    }

    /**
     * 보드 히스토리 초기화
     */
    resetBoardHistory(): void {
        this.boardHistory.value = [];
    }

    /**
     * 보드 히스토리에 아이템 추가
     * @param item 추가할 히스토리 아이템
     */
    addBoardHistoryItem(item: boardHistoryItem): void {
        this.boardHistory.value = [...this.boardHistory.value, item];
    }


    /**
     * 움직임
     * @param row 
     * @param col 
     */
    abstract makeMove(row: number, col: number): boolean;

    /**
     * 턴 넘기기.
     * 1v1 게임이니 편하게 스위칭 하기 위해 
     * 해당 메서드를 사전에 구현하고 사용.
     */
    abstract whoNext(): TileValue;
    
    /**
     * 승리조건
     */
    abstract checkWinner(): TileValue;

    /**
     * 플레이어 전환
     */
    switchPlayer(player: TileValue): void {
        if (Object.values(BoardGame.Tile).includes(player)) {
            this.currentPlayer = player;
        } else {
            throw new Error("Invalid player value");
        }
    }

    getBoard(): Array<Array<TileValue>> {
        return this.board.value;
    }

    getCurrentPlayer(): TileValue {
        return this.currentPlayer;
    }

    setPlayer(player: TileValue): void {
        if (player === BoardGame.Tile.X || player === BoardGame.Tile.O || player === BoardGame.Tile.EMPTY) {
            this.currentPlayer = player;
        } else {
            throw new Error("Invalid player value");
        }
    }

    static addTile(name: string, value: number): void {
        if (name in BoardGame.Tile) {
            throw new Error(`Tile ${name} already exists`);
        }
        BoardGame.Tile = { ...BoardGame.Tile, [name]: value };
    }

    /**
     * 보드 사이즈 변경 및 초기화
     * @param rows 새로운 보드 행 수
     * @param cols 새로운 보드 열 수
     */
    setBoardSize(rows: number, cols: number): void {
        this.board.value = (Array.from({ length: rows }, () => Array(cols).fill(BoardGame.Tile.EMPTY)));
    }
}

export { BoardGame };    
export type { TileValue };
