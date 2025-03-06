import VariableGetSet from "./getset";

type TileValue = typeof BoardGame.Tile[keyof typeof BoardGame.Tile];

type globalBoardHistory = {
    histroy: boardHistoryItem[],
    winner: TileValue | any,
};

type boardHistoryItem = {
    
    //보드 진행상황
    board: Array<Array<TileValue>>,
    
    //x축
    col: number;
    
    //y축
    row: number;
    
    //현재 플레이어
    currentPlayer: TileValue;

    //둔 타일
    whichTile: TileValue;
}

type boardActionDenied = {moved: boolean, reason?: string};

/**
 * 턴제 보드게임 추상 클래스
 */
abstract class BoardGame {

    public static Tile: Record<string, number | string> = {
        EMPTY: 0, //예약 된 놈
    };

    static addTile(name: string, value: string | number): void {
        if (name in BoardGame.Tile) {
            throw new Error(`Tile ${name} already exists`);
        }
        BoardGame.Tile[name] = value;
    }

    /**
     * @description currentPlayer 현재 플레이어
     */
    protected currentPlayer: VariableGetSet<TileValue>;

    /**
     * @description board 게임 보드
     */
    protected board: VariableGetSet<Array<Array<TileValue>>>;


    /**
     * 전체 보드 히스토리
     */
    protected globalBoardHistory: VariableGetSet<globalBoardHistory[]>;

    /**
     * @description boardHistory 게임 보드 히스토리
     */
    protected boardHistory: VariableGetSet<boardHistoryItem[]>;






    constructor(rows: number, cols: number) {
        this.board = new VariableGetSet(Array.from({ length: rows }, () => Array(cols).fill(BoardGame.Tile.EMPTY)));
        this.globalBoardHistory = new VariableGetSet([]);
        this.boardHistory = new VariableGetSet([]);
        this.currentPlayer = new VariableGetSet<TileValue>(BoardGame.Tile.EMPTY); // 초기에는 플레이어가 설정되지 않음
    }


    /**
     * 전체 보드 히스토리 초기화
     */
    resetGlobalBoardHistory(): void {
        this.globalBoardHistory.value = [];
    }

    /**
     * 전체 보드 히스토리에 아이템 추가
     * @param item 추가할 히스토리 아이템
     */
    addGlobalBoardHistoryItem(item: globalBoardHistory): void {
        this.globalBoardHistory.value = [...this.globalBoardHistory.value, item];   
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
    abstract makeMove(row: number, col: number): boardActionDenied;

    /**
     * 턴 넘기기.
     * 편하게 스위칭 하기 위해 해당 메서드를 사전에 구현하고 사용.
     * 실제로 플레이어가 전환되진 않기 때문에. switchPlayer 메서드를 사용해야 함.
     */
    abstract whoNext(): TileValue;
    
    /**
     * 승리조건
     */
    abstract checkWinner(): {value: TileValue | any, type: 'status' | 'tile'};

    /**
     * 플레이어 전환
     */
    switchPlayer(player: TileValue): void {
        if (Object.values(BoardGame.Tile).includes(player)) {
            this.currentPlayer.value = player;
        } else {
            throw new Error("Invalid player value");
        }
    }

    getBoard(): Array<Array<TileValue>> {
        return this.board.value;
    }

    getCurrentPlayer(): TileValue {
        return this.currentPlayer.value;
    }

    /**
     * 플레이어 설정
     * @param player 플레이어
     */
    abstract setCurrentPlayer(player: TileValue): void;

    
    /**
     * 타일 값 가져오기
     * @param key 타일 키
     * @returns 타일 값
     * 
     * ```
     * 예약어 목록
     * EMPTY = 0 
     * ```
     */
    tile<K extends keyof typeof BoardGame.Tile>(key: K): typeof BoardGame.Tile[K] {
        return BoardGame.Tile[key];
    }

    /**
     * 타일 추가
     * @param name 타일 이름
     * @param value 타일 값
     */
    addTile(name: string, value: number): void {
        if (name in BoardGame.Tile) {
            throw new Error(`Tile ${name} already exists`);
        }
        BoardGame.Tile[name] = value;
    }

    /**
     * 보드 사이즈 변경 및 초기화
     * @param rows 새로운 보드 행 수
     * @param cols 새로운 보드 열 수
     */
    setBoardSize(rows: number, cols: number): void {
        this.board.value = (Array.from({ length: rows }, () => Array(cols).fill(BoardGame.Tile.EMPTY)));
    }

    /**
     * 객체를 참조 복사가 아닌 값 복사로 완전히 복사해서 반환
     * @param obj 복사할 객체
     * @returns 복사된 객체
     */
    deepCopy<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }


}

export { BoardGame };    
export type { TileValue, boardActionDenied };