import VariableGetSet from "../getset";
import { tictactoeGameBehavior } from './tictactoe';

/**
 * 틱텍토 게임 확장 클래스
 * - 특수 규칙1: 전체 시간이 존재한다
 * - 특수 규칙2: 슬라이드 시간이 존재한다(한 턴당 제한시간)
 * - 특수 규칙3: 새로운 턴의 시작은 랜덤이다. ai가 먼제 시작할 수도 있고 플레이어가 먼저 시작할 수도 있다.
 * - 특수 규칙4: 라운드가 넘어갈 수록 맵의 크기와 승리 조건인 타일 연속 갯수가 달라진다. 라운드가 넘어갈수록 변동이 심해지고. 맵 크기나 승리조건 연속 갯수의 크기에 따라 슬라이드 시간이 달라진다. 
 * - 특수 규칙5: 점수는 라운드가 진행될수록 추가 점수가 붙는다.
 * - 특수 규칙6: 점수는 게임 무승부 시 무점, 게임 승리 시 득점, 게임 패배 시 상실점이 있다. 특수하게 승리 시 ai가 다음 턴에 이길 제안을 했다면 득점에 감점을 부과한다. (ai 턴 계산은 게임 종료 시 게임 기록을 대조해서 그 상황에서 ai가 이길 수 있는 경우를 계산해서 추가 점수를 부여) 
 */
class tictactoeExtendsSpecialRules extends tictactoeGameBehavior {

    /**
     * 전체 시간
     * - 전체 시간이란? : 틱텍토 게임에서 모든 판을 진행부터 종료까지의 제한 시간
     */
    public globalMaxTimer: VariableGetSet<number>;
    
    /**
     * 진행 시간
     */
    public globalTimer: VariableGetSet<number>;

    /**
     * 슬라이드 전체 시간
     * - 슬라이드 시간이란? : 틱텍토 게임에서 한번의 턴을 진행할 때 다음 수를 둬야하는 제한 시간
     */
    public slideMaxTimer: VariableGetSet<number>;

    /**
     * 슬라이드 진행 시간
     */
    public slideTimer: VariableGetSet<number>;

    /**
     * 현재 라운드
     */
    public currentRound: VariableGetSet<number>;

    /**
     * 맵 크기
     */
    public mapSizeX: VariableGetSet<number>;
    public mapSizeY: VariableGetSet<number>;



    /**
     * 점수
     */
    public score: VariableGetSet<number>;

    constructor() {
        super();

        //init vars
        this.globalMaxTimer = new VariableGetSet(0);
        this.globalTimer = new VariableGetSet(0);
        this.slideMaxTimer = new VariableGetSet(0);
        this.slideTimer = new VariableGetSet(0);
        this.currentRound = new VariableGetSet(0);
        this.mapSizeX = new VariableGetSet(0);
        this.mapSizeY = new VariableGetSet(0);
        this.score = new VariableGetSet(0);
        this.initalizeGame(); //해당 확장에서 실행행
    }

    /**
     * 게임 초기화
     * - 초기화 시켜준댔지 플레이어 선택 안해준다. 직접 하세요~
     */
    initalizeGame(): void {
        this.globalMaxTimer.value = 0;
        this.globalTimer.value = 0;
        this.slideMaxTimer.value = 0;
        this.slideTimer.value = 0;
        this.currentRound.value = 0;
        this.mapSizeX.value = 0;
        this.mapSizeY.value = 0;
        this.score.value = 0;
    }

    setBoardSize(rows: number, cols: number): void {
        this.mapSizeX.value = rows;
        this.mapSizeY.value = cols;
        super.setBoardSize(rows, cols); //상위 클레스에서 실행
    }

    /**
     * 단순 점수 계산
     */
    calcScore(): void {
        const roundScore = this.currentRound.value * 10;
        
        
        //합산
        this.score.value = roundScore;
    }

    /**
     * ai 턴에 대한 점수 계산
     * - 종료 시점의 보드에서 "다음 수를 둘 수 있고 그 최적의 수가 ai도 이기는 보드가 된다면" 상태를 검사해서 점수를 부여
     * @param callbackProgress 
     * @param callbackDone 
     */
    calcScoreAITurnWin(callbackProgress: (aiCanBeWinner: boolean) => void, callbackDone: () => void): void {
        for (let index = 0; index < this.globalBoardHistory.value.length; index++) {
            const board = this.globalBoardHistory.value[index];
            // if (board.winner )
            callbackProgress(false);
        }

        callbackDone();
    }




}

export { tictactoeExtendsSpecialRules }