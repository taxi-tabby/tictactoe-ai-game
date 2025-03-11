import Phaser from 'phaser';

type specifiedGridSizePos = { row: number, col: number };
type specifiedGridSizeData = { width?: number, height?: number };
type specifiedGridSize = { pos: specifiedGridSizePos, size?: specifiedGridSizeData };

type addObjectOption = {
    callbackRenderUpdate?: (() => void) | undefined;
 };

// GridLayout 클래스: Phaser.GameObjects.Container를 확장하여 동적 그리드를 관리
class GridLayout extends Phaser.GameObjects.Container {
    private rows: number;
    private columns: number;
    private spacing: number;

    //지정된 그리드 크기 지정
    private specifiedGridSize: specifiedGridSize[];


    //오브젝트 그리드
    private grid: (Phaser.GameObjects.GameObject | null)[][];
    
    //렌더링 콜백 그리드
    private renderUpdateEventGrid: ((() => void) | undefined)[][];

    constructor(scene: Phaser.Scene, rows: number = 3, columns: number = 3, spacing: number = 0) {
        super(scene, 0, 0);
        this.rows = rows;
        this.columns = columns;
        this.spacing = spacing;
        this.specifiedGridSize = [];
        

        // 그리드를 2D 배열로 초기화
        this.grid = Array.from({ length: rows }, () => Array(columns).fill(null));
        this.renderUpdateEventGrid = Array.from({ length: rows }, () => Array(columns).fill(undefined));
    }

    // 그리드에 GameObject 또는 Container 추가
    addToGrid(gameObject: Phaser.GameObjects.GameObject | Phaser.GameObjects.Container, x: number, y: number, options: addObjectOption = {}) {
        // 그리드 크기 확장 체크
        this.expandGrid(x, y);

        if (gameObject instanceof Phaser.GameObjects.Container) {
            // 컨테이너일 경우 하위 객체들을 그리드에 추가하고 위치 설정
            this.addContainerToGrid(gameObject, x, y);
        } else {
            // 일반 게임 객체일 경우 그리드에 추가
            this.addObjectToGrid(gameObject, x, y, options);
        }

        // console.log('그리드 상태:', this.grid);
    }

    private callEventRenderUpdate(x: number, y: number) {
        if (this.renderUpdateEventGrid[y][x] !== undefined) {
            const e = this.renderUpdateEventGrid[y][x];
            if (e) e();
        }
    }

    // 그리드에 일반 GameObject 추가
    private addObjectToGrid(gameObject: Phaser.GameObjects.GameObject, x: number, y: number, options: addObjectOption = {}) {
        let width = 0;
        let height = 0;

        // 텍스트, 이미지, 스프라이트 객체만 width와 height를 가집니다.
        if (gameObject instanceof Phaser.GameObjects.Text) {
            width = gameObject.width;
            height = gameObject.height;
        } else if (gameObject instanceof Phaser.GameObjects.Image) {
            width = gameObject.width;
            height = gameObject.height;
        } else if (gameObject instanceof Phaser.GameObjects.Sprite) {
            width = gameObject.width;
            height = gameObject.height;
        }

        // 그리드 내에서 지정된 x, y 위치에 추가 (비율로 위치 계산)
        const row = y;
        const col = x;

        
        // 그리드 범위 체크
        if (row < this.rows && col < this.columns) {
            // 그리드에 GameObject 위치 지정
            this.grid[row][col] = gameObject;

            console.log(`(row: ${row}, col: ${col})에 추가됨`);

            // 화면 크기 가져오기
            const { width: screenWidth, height: screenHeight } = this.scene.scale;

            // 게임 객체의 x, y 위치를 그리드에 맞게 재계산 (비율 기반)
            const newX = (col / this.columns) * screenWidth + this.spacing;
            const newY = (row / this.rows) * screenHeight + this.spacing;

            // 위치를 그리드에 맞게 설정 (Phaser.GameObjects.GameObject의 하위 객체들만 setPosition 호출)
            if (gameObject instanceof Phaser.GameObjects.Sprite ||
                gameObject instanceof Phaser.GameObjects.Image ||
                gameObject instanceof Phaser.GameObjects.Text) {
                gameObject.setPosition(newX, newY);
            }

            // Container에 게임 객체를 추가
            this.add(gameObject);

            //이벤트 추가
            if (options.callbackRenderUpdate !== undefined) {
                this.renderUpdateEventGrid[row][col] = options.callbackRenderUpdate;
            }

            //랜더링 이벤트 실행
            this.callEventRenderUpdate(col, row);
        }
    }

    // 그리드에 Container 추가 (재귀적으로 하위 자식 처리)
    private addContainerToGrid(container: Phaser.GameObjects.Container, x: number, y: number) {
        // 컨테이너의 x, y 위치를 그리드에 맞게 설정
        container.setPosition(x, y);

        // 하위 객체들을 그리드에 추가
        container.list.forEach((child) => {
            this.addToGrid(child, x, y); // 자식 객체를 그리드에 추가
        });

        // 컨테이너 자체를 그리드에 추가
        this.add(container);
    }

    /**
     * 그리드 내 모든 객체의 위치를 새로 배치합니다.
     * 전체 객체의 위치를 재조정 하는 용도입니다.
     */
    layoutGrid() {
        this.grid.forEach((row, rowIndex) => {
            row.forEach((gameObject, colIndex) => {
                if (gameObject) {
                    this.updateItemPosition(gameObject, rowIndex, colIndex);
                }
            });
        });
    }

    /**
     * 그리드에서 객체의 위치를 재조정하기 위한 메서드
     * 단일 그리드의 위치를 재조정합니다
     * @param gameObject 
     * @param row 
     * @param col 
     */
    updateItemPosition(gameObject: Phaser.GameObjects.GameObject, row: number, col: number) {
        let width = 0;
        let height = 0;

        let debugObjectType = '';

        // 텍스트, 이미지, 스프라이트 객체만 width와 height를 가집니다.
        if (gameObject instanceof Phaser.GameObjects.Text) {
            width = gameObject.width;
            height = gameObject.height;
            debugObjectType = 'text';
        } else if (gameObject instanceof Phaser.GameObjects.Image) {
            width = gameObject.width;
            height = gameObject.height;
            debugObjectType = 'Image';
        } else if (gameObject instanceof Phaser.GameObjects.Sprite) {
            width = gameObject.width;
            height = gameObject.height;
            debugObjectType = 'Sprite';
        }

        console.log('----------------- ', debugObjectType, row, col, width, height);

        const specifiedGridSize = this.getSpecifiedGridSize({pos: {row, col}});

        // 화면 크기 가져오기
        const { width: screenWidth, height: screenHeight } = this.scene.scale;
        // 그리드에 맞는 x, y 위치 계산 (비율 기반)
        let newX = (col / this.columns) * screenWidth + this.spacing;
        let newY = (row / this.rows) * screenHeight + this.spacing;

        // // specifiedGridSize 값이 있는 경우 해당 값을 우선으로 사용
        // if (specifiedGridSize && specifiedGridSize.size) {
        //     if (specifiedGridSize.size.width !== undefined) {
        //         newX = specifiedGridSize.size.width;
        //     }
        //     if (specifiedGridSize.size.height !== undefined) {
        //         newY = specifiedGridSize.size.height;
        //     }
        // }

  

        // 위치를 그리드에 맞게 설정
        if (gameObject instanceof Phaser.GameObjects.Sprite ||
            gameObject instanceof Phaser.GameObjects.Image ||
            gameObject instanceof Phaser.GameObjects.Text) {
            gameObject.setPosition(newX, newY);
        }

        this.callEventRenderUpdate(col, row);
    }

    /**
     * 그리드 크기를 동적으로 확장하는 메서드
     * 입력되는 크기에 따라 확장합니다.
     * @param x 
     * @param y 
     */
    private expandGrid(x: number, y: number) {
        const requiredRows = y + 1; // 최소 y+1 만큼의 행이 필요
        const requiredCols = x + 1; // 최소 x+1 만큼의 열이 필요

        // 그리드 크기가 필요 이상이면 확장
        if (requiredRows > this.rows) {
            for (let i = this.rows; i < requiredRows; i++) {
                this.grid.push(Array(this.columns).fill(null)); // 새로운 행 추가
                this.renderUpdateEventGrid.push(Array(this.columns).fill(null));
            }
            this.rows = requiredRows;
        }

        if (requiredCols > this.columns) {
            for (let i = 0; i < this.rows; i++) {
                this.grid[i].length = requiredCols; // 각 행에 열을 추가
                this.renderUpdateEventGrid[i].length = requiredCols;
            }
            this.columns = requiredCols;
        }
    }


    private getObjectAt(gameObject: Phaser.GameObjects.GameObject): { row: number, col: number } | undefined {
        // grid에서 해당 gameObject가 위치한 row, col을 찾음
        let row = -1;
        let col = -1;

        // this.grid에서 해당 gameObject를 찾아 그 위치(row, col)를 찾습니다.
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {
                if (this.grid[r][c] === gameObject) {
                    row = r;
                    col = c;
                    break;
                }
            }
            if (row !== -1 && col !== -1) break; // 찾았으면 바로 종료
        }

        // gameObject가 grid에 없을 경우
        if (row === -1 || col === -1) {
            console.error("The specified gameObject is not found in the grid.");
            return undefined;
        }

        return { row, col };
    }

    // 특정 GameObject나 Container가 속한 그리드 셀의 절대 좌표와 크기를 얻는 메서드
    getBoundsOfObject(gameObject: Phaser.GameObjects.GameObject, spacing: boolean = false) {
        // 그리드의 크기 (행, 열)
        const { width: screenWidth, height: screenHeight } = this.scene.scale;

        // 그리드 셀의 크기 계산
        const cellWidth = screenWidth / this.columns;
        const cellHeight = screenHeight / this.rows;

        // spacing이 true일 경우 this.spacing을 사용하고, false일 경우 0을 사용
        const spacingValue = spacing ? this.spacing : 0;

        // grid에서 해당 gameObject가 위치한 row, col을 찾음
        const objectAt = this.getObjectAt(gameObject);

        if (objectAt === undefined)
            return null;

        // 해당 그리드 셀의 좌상단 좌표 계산
        const cellX = objectAt.col * cellWidth + spacingValue;
        const cellY = objectAt.row * cellHeight + spacingValue;

        const w = cellWidth - spacingValue;
        const h = cellHeight - spacingValue;

        // 반환: 그리드 셀의 좌상단 좌표와 셀의 크기
        return {
            x: cellX,  // 셀의 좌상단 x
            y: cellY,  // 셀의 좌상단 y
            w: w,       // 셀의 너비
            h: h        // 셀의 높이
        };
    }

    // 각 그리드 셀의 좌상, 우상, 좌하, 우하 절대값 계산
    getCellBounds(row: number, col: number, spacing: boolean = false) {
        // 화면 크기 가져오기
        const { width: screenWidth, height: screenHeight } = this.scene.scale;

        // 각 그리드 셀의 크기 계산
        const cellWidth = screenWidth / this.columns;
        const cellHeight = screenHeight / this.rows;

        // spacing이 true일 경우 this.spacing을 사용하고, false일 경우 0을 사용
        const spacingValue = spacing ? this.spacing : 0;

        // 그리드의 좌상, 우상, 좌하, 우하 값 계산
        const x = col * cellWidth + spacingValue;
        const y = row * cellHeight + spacingValue;

        const w = cellWidth - spacingValue;
        const h = cellHeight - spacingValue;

        // 반환: 각 셀의 좌상단, 우상단, 좌하단, 우하단 좌표
        return {
            topLeft: { x, y },
            topRight: { x: x + w, y },
            bottomLeft: { x, y: y + h },
            bottomRight: { x: x + w, y: y + h }
        };
    }


    // 그리드 셀의 너비와 높이를 계산하여 반환하는 메서드
    //spacing 값을 계산하지 않음.
    getCellSize() {
        // 화면 크기 가져오기
        const { width: screenWidth, height: screenHeight } = this.scene.scale;

        // 그리드 셀의 크기 계산
        const cellWidth = screenWidth / this.columns;
        const cellHeight = screenHeight / this.rows;

        return { width: cellWidth, height: cellHeight };
    }

    updateSpacing(spacing: number) {
        this.spacing = spacing;
    }



    /**
     * 지정된 그리드 크기를 설정합니다.
     * data 의 size 값이 없는 경우 해제됩니다.
     * @param data 
     */
    private setSpecifiedGridSize(data: specifiedGridSize) {
        const existingIndex = this.specifiedGridSize.findIndex(grid => grid.pos.row === data.pos.row && grid.pos.col === data.pos.col);
        if (existingIndex !== -1) {
            if (data.size && (data.size.width !== undefined || data.size.height !== undefined)) {
                this.specifiedGridSize[existingIndex] = data;
            } else {
                this.specifiedGridSize.splice(existingIndex, 1);
            }
        } else {
            this.specifiedGridSize.push(data);
        }
    }
    

    private getSpecifiedGridSize(data: specifiedGridSize) {
        const existingIndex = this.specifiedGridSize.findIndex(grid => grid.pos.row === data.pos.row && grid.pos.col === data.pos.col);
        if (existingIndex !== -1) {
            return this.specifiedGridSize[existingIndex];
        } else {
            return undefined;
        }
    }

    /**
     * 위치로 지정된 쉘 그리드 
     * @param data 
     */
    setGridSizeByGridPos(data: specifiedGridSize) {
        this.setSpecifiedGridSize(data);
    }

    /**
     * 오브젝트로 지정된 쉘 그리드
     * @param gameObject 
     * @param data 
     */
    setGridSizeByObject(gameObject: Phaser.GameObjects.GameObject, data?: specifiedGridSizeData) {
        const objectAt = this.getObjectAt(gameObject);
        if (objectAt !== undefined)
            this.setSpecifiedGridSize({pos: {col: objectAt.col, row: objectAt.row}, size: data});
    }

}

// 레이어 컨테이너 생성 함수
export default function createLayerContainer(scene: Phaser.Scene, layerName: string): GridLayout {
    const layerContainer = new GridLayout(scene); // GridLayout으로 확장된 컨테이너 생성
    layerContainer.name = layerName;

    return layerContainer;
}
