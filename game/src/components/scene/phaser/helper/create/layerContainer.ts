import Phaser from 'phaser';

type specifiedGridSizePos = { row: number, col: number };
type specifiedGridSizeData = { width?: number, height?: number };
type specifiedGridSize = { pos: specifiedGridSizePos, size?: specifiedGridSizeData };


type containerObject = GridLayout | Phaser.GameObjects.Container;
type gameObject = Phaser.GameObjects.GameObject | Phaser.GameObjects.Graphics | Phaser.GameObjects.Text | Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
type acceptableObject = any | containerObject | gameObject;

type callbackRenderUpdateObject = acceptableObject;

type gameContainerObjectHandler = (parent: containerObject, self: containerObject) => void | [];
type gameObjectHandler = (gameObject: callbackRenderUpdateObject) => void | [];
type voidActionHandler = () => void;

type addObjectOption = {

    /**
     * 랜더링이 발생하는 경우 같이 실행되는 콜백
     * - 이 콜백은 내부 게임 오브젝트에 대해 실행됩니다.
     * - 콜백에 인자로 오는 gameObject는 대상 오브젝트입니다. (현재 버그로 인해 동일 x, y 상에 존재하는 모든 오브젝트가 한 번 씩 인자로 들어옴. 수정이 필요하며 해결 전까진 조건문으로 인스턴스를 비교하여 구별해야 합니다.) 
     */
    callbackRenderUpdate?: ((gameObject: callbackRenderUpdateObject) => void);

    /**
     * 계층적인 구조를 만들 때 내부에서 생성할 오브제를 위해 존재하는 콜백.
     * - 이 콜백은 내부 게임 컨테이너 오브젝트 (`containerObject`) 에 해당하는 경우 실행됩니다.
     * - 이 콜백은 인스턴스가 준비되었을 때 한번 직접 실행해야 합니다. `runHierarchicalEvent` 메서드를 통해 실행할 수 있습니다. 
     */
    callbackHierarchicalCreate?: gameContainerObjectHandler
 };

// GridLayout 클래스: Phaser.GameObjects.Container를 확장하여 동적 그리드를 관리
class GridLayout extends Phaser.GameObjects.Container {
    private rows: number;
    private columns: number;
    private spacing: number;

    //지정된 그리드 크기 지정
    private specifiedGridSize: specifiedGridSize[];


    //오브젝트 그리드
    private grid: (gameObject | gameObject[] | null)[][];
    
    //렌더링 콜백 그리드
    private renderUpdateEventGrid: (gameObjectHandler[])[][];

    //내부 오브제 생성용 콜백 그리드
    private hierarchicalCreateEventGrid: (gameContainerObjectHandler[])[][];

    //상위 오브젝트
    private parentObject: containerObject | undefined;

    //callbackHierarchicalCreate

    constructor(scene: Phaser.Scene, rows: number = 0, columns: number = 0, spacing: number = 0) {
        super(scene, 0, 0);
        this.rows = rows;
        this.columns = columns;
        this.spacing = spacing;
        this.specifiedGridSize = [];
        

        // 그리드를 2D 배열로 초기화
        this.grid = Array.from({ length: rows }, () => Array(columns).fill(null));
        this.renderUpdateEventGrid = Array.from({ length: rows }, () => Array(columns).fill(undefined));
        this.hierarchicalCreateEventGrid = Array.from({ length: rows }, () => Array(columns).fill(undefined));
        
    }

    // 그리드에 GameObject 또는 Container 추가
    addToGrid(gameObject: acceptableObject, x: number, y: number, options: addObjectOption = {}) {
        

        // 그리드 크기 확장 체크
        this.expandGrid(x, y);

        if (gameObject instanceof Phaser.GameObjects.Container || gameObject instanceof GridLayout) {
            // 컨테이너일 경우 하위 객체들을 그리드에 추가하고 위치 설정
            // console.log(`컨테이너 ${this.name} (row: ${y}, col: ${x}) 에 하위 컨테이너 `, [gameObject.name || '[noname]', gameObject], '추가됨');
            this.addContainerToGrid(gameObject, x, y, options);

        } else {
            // 일반 게임 객체일 경우 그리드에 추가
            // console.log(`컨테이너 ${this.name} (row: ${y}, col: ${x}) 에 하위 일반 오브젝트 `, [gameObject.name || '[noname]', gameObject], '추가됨');
            this.addObjectToGrid(gameObject, x, y, options);
        }


        this.parentObject = gameObject;
    }


    setCallbackRenderUpdate(object: acceptableObject, callback: ((gameObject: callbackRenderUpdateObject) => void)) {
        

        const objectAt = this.getObjectAt(object);



        if (objectAt != undefined) {
            const arr = this.renderUpdateEventGrid[objectAt.row][objectAt.col];

            if (objectAt.objectAll != undefined && Array.isArray(objectAt.objectAll)) {
                const index = objectAt.objectAll.indexOf(objectAt.object);
                if (arr) {
                    this.renderUpdateEventGrid[objectAt.row][objectAt.col][index] = callback;
                } else {
                    this.renderUpdateEventGrid[objectAt.row][objectAt.col] = Array(index + 1).fill(undefined);
                    this.renderUpdateEventGrid[objectAt.row][objectAt.col][index] = callback;
                }
            } else {
                if (arr) {
                    this.renderUpdateEventGrid[objectAt.row][objectAt.col][0] = callback;
                } else {
                    this.renderUpdateEventGrid[objectAt.row][objectAt.col] = [callback];
                }
            }
        } else {
            throw new Error("No object found at the specified coordinates.");
        }
    }


    private callEventRenderUpdate(obj: gameObject | containerObject, x: number, y: number) {
        
        const at = this.getObjectAt(obj);

        if (at === undefined) {
            throw new Error("The specified gameObject is not found in the grid.");
        }

        if (x !== at.col || y !== at.row) {
            throw new Error("The object's current position does not match the specified coordinates.");
        }


        

        if (this.renderUpdateEventGrid[y][x] == undefined) {
            return;
        }

        const arr = this.renderUpdateEventGrid[y][x];

        if (arr.length == 0) {
            return;
        }


  
        if (obj instanceof GridLayout && obj instanceof Phaser.GameObjects.Container) {

            if (at.objectAll != undefined && Array.isArray(at.objectAll)) {
                let index = at.objectAll.indexOf(at.object);
                const e = arr[index];
                if (e != undefined)  {
                    e(at.object);
                    // console.log("-------------------", [this.name, obj.name], '이벤트 실행 해' , `${index} 번째 인덱스 랜더링 콜백`);
                }
            } else {
                const e = arr[0];
                if (e != undefined) {
                    e(at.object);
                    // console.log("-------------------", [this.name, obj.name], '이벤트 실행 해' , ` 단일 인덱스(0) 랜더링 콜백`);
                }
            }
        } else {

            // if (obj.name == 'grid_gameBoardRect') {
            //     console.log(this.name, obj.name);
            //     console.log(this.grid[y][x]);
            //     console.log(this.renderUpdateEventGrid[y][x]);
            // }
    

            if (at.objectAll != undefined && Array.isArray(at.objectAll)) {
                let index = at.objectAll.indexOf(at.object);
                const e = arr[index];


        

                if (e != undefined)  {
                    e(at.object);
                    // console.log("-------------------", [this.name, obj.name], '이벤트 실행 해' , `${index} 번째 인덱스 랜더링 콜백`);
                }
            } else {
                const e = arr[0];
                if (e != undefined) {
                    e(at.object);
                    // console.log("-------------------", [this.name, obj.name], '이벤트 실행 해' , ` 단일 인덱스(0) 랜더링 콜백`);                    
                }
            }
        }


  

        


    
        

    }

    // 그리드에 일반 GameObject 추가
    private addObjectToGrid(gameObject: Phaser.GameObjects.GameObject, x: number, y: number, options: addObjectOption = {}) {
        


        // // 아직 인스턴스별로 크기 계산을 해서 오브젝트의 위치를 계산하지 않음.. 여유가 없음.
        // let width = 0;
        // let height = 0;

        // // 텍스트, 이미지, 스프라이트 객체만 width와 height를 가집니다.
        // if (gameObject instanceof Phaser.GameObjects.Text) {
        //     width = gameObject.width;
        //     height = gameObject.height;
        // } else if (gameObject instanceof Phaser.GameObjects.Image) {
        //     width = gameObject.width;
        //     height = gameObject.height;
        // } else if (gameObject instanceof Phaser.GameObjects.Sprite) {
        //     width = gameObject.width;
        //     height = gameObject.height;
        // }

        // 그리드 내에서 지정된 x, y 위치에 추가 (비율로 위치 계산)
        const row = y;
        const col = x;

        
        // 그리드 범위 체크
        if (row < this.rows && col < this.columns) {
            // 그리드에 GameObject 위치 지정
            if (this.grid[row][col] !== null) {
                if (Array.isArray(this.grid[row][col])) {
                    // console.log("1111111111111111111111111111");
                    // console.log("1111111111111111111111111111");
                    // console.log("1111111111111111111111111111");
                    (this.grid[row][col] as acceptableObject[]).push(gameObject);
                } else {

                    this.grid[row][col] = [this.grid[row][col] as acceptableObject, gameObject];
                }
            } else {
                this.grid[row][col] = gameObject;
            }





            // Container에 게임 객체를 추가
            this.add(gameObject);

            //개별 위치 업데이트?
            this.updateItemPosition(gameObject, row, col);

            //이벤트 추가
            // if (options.callbackRenderUpdate !== undefined) {
            //     if (this.renderUpdateEventGrid[row][col]) {
            //         this.renderUpdateEventGrid[row][col].push(options.callbackRenderUpdate);
            //     } else {
            //         this.renderUpdateEventGrid[row][col] = [options.callbackRenderUpdate];
            //     }
            // }
            if (options.callbackRenderUpdate) {
                this.setCallbackRenderUpdate(gameObject, options.callbackRenderUpdate);
            }
 


            //랜더링 이벤트 실행
            this.callEventRenderUpdate(gameObject, col, row);
        }
    }


    // 그리드에 Container 추가 (재귀적으로 하위 자식 처리)
    private addContainerToGrid(container: containerObject, x: number, y: number, options: addObjectOption = {}) {
        // 그리드 내에서 지정된 x, y 위치에 추가 (비율로 위치 계산)
        const row = y;
        const col = x;

        // console.log(container.name, '추가됨', row, col);

        // 그리드 범위 체크
        if (row < this.rows && col < this.columns) {
            // 그리드에 GameObject 위치 지정
            if (this.grid[row][col] !== null) {
                if (Array.isArray(this.grid[row][col])) {
                    
                    const arr = this.grid[row][col] as containerObject[];
                    arr.push(container);



                    if (options.callbackHierarchicalCreate !== undefined) {
                        const index = arr.indexOf(container);
                        this.hierarchicalCreateEventGrid[row][col] = Array(index + 1).fill(undefined);
                        this.hierarchicalCreateEventGrid[row][col][index] = options.callbackHierarchicalCreate;
                    }


                    for (const element of arr) {
                        if (element instanceof GridLayout) 
                            element.layoutGrid();
                    }

                    // console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 배열 추가", container.name, this.hierarchicalCreateEventGrid[row][col]);

                } else {
                    const arrContainer = [this.grid[row][col] as containerObject, container];
                    this.grid[row][col] = arrContainer;

                    if (options.callbackHierarchicalCreate !== undefined) {
                        const index = arrContainer.indexOf(container);
                        this.hierarchicalCreateEventGrid[row][col] = [...this.hierarchicalCreateEventGrid[row][col]];
                        this.hierarchicalCreateEventGrid[row][col][index] = options.callbackHierarchicalCreate;
                    }

                    for (const element of arrContainer) {
                        if (element instanceof GridLayout) 
                            element.layoutGrid();
                    }

                    // console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 배열 생성", container.name, this.grid[row][col], this.hierarchicalCreateEventGrid[row][col]);
                }
            } else {
                

                this.grid[row][col] = container;
                if (options.callbackHierarchicalCreate !== undefined) 
                    this.hierarchicalCreateEventGrid[row][col] = [options.callbackHierarchicalCreate];

                if (container instanceof GridLayout)
                        container.layoutGrid();

                // console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 단일 추가", container.name, this.hierarchicalCreateEventGrid[row][col]);


            }


        }
        
        

        // 컨테이너 자체를 그리드에 추가
        this.add(container);

        // //이벤트 실행
        // this.runHierarchicalEvent(container);
    }


    /**
     * 컨테이너를 찾아 하위 생성 콜백 이벤트 실행
     * 직접 실행시켜야 함. 오브제 생성은 해당 레이어에서 확인할 조건이 떠오르지 않음.
     * @param container 
     */
    runHierarchicalEvent(container: containerObject) {


        // if (container.name == 'layer_gameContainer') {
        //     console.log('runHierarchicalEvent: ');
        //     console.log('-####################################');
        //     console.log('-------------------------', this.name, '->', container.name);
        //     console.log('grid:', this.grid);
        //     console.log('r-event', this.renderUpdateEventGrid);
        //     console.log('h-event', this.hierarchicalCreateEventGrid);
        //     console.log('-####################################');
        // }


        const grid = this.getGrid();
        const at = this.getObjectAt(container);

 
        if (at === undefined) {
            throw new Error("The specified gameObject is not found in the grid.");
        }



        // 생성 이벤트를 실행.
        try {
            const gridPoint = grid[at.row][at.col];
            const eventPoint = this.hierarchicalCreateEventGrid[at.row][at.col];
    
            if (gridPoint && Array.isArray(gridPoint)) {
                const idx = gridPoint.indexOf(container);
                const eventCallback = eventPoint[idx];
                if (eventCallback) {
                    eventCallback(this, container);
                }
            } else {
                // console.log(`이벤트 ${container.name}`,eventPoint);
                const eventCallback = eventPoint[0];
                eventCallback(this, container);
            }
    
        } catch(e) {
            console.error(e);
            throw new Error(`Error in hierarchicalCreateEventGrid`);
        }
    }


    /**
     * 그리드 내 모든 객체의 위치를 새로 배치합니다.
     * 전체 객체의 위치를 재조정 하는 용도입니다.
     */
    layoutGrid() {
        // console.log(`%c--- layoutGrid (  ${this.name}  )   ->`, 'background: #222; color: #bada55', this.grid);

        this.grid.forEach((row, rowIndex) => {
            row.forEach((gameObject, colIndex) => {
                if (gameObject != null) {
                    // console.log([gameObject]);
                    if (!Array.isArray(gameObject) && gameObject) {
                        if (gameObject instanceof GridLayout || gameObject instanceof Phaser.GameObjects.Container) {
                            this.updateContainerPosition(gameObject, rowIndex, colIndex);
                        } else {
                            this.updateItemPosition(gameObject, rowIndex, colIndex);
                        }
                    }
                    if (Array.isArray(gameObject)) {
                        gameObject.forEach((buffer) => {
                            if (buffer != undefined) {
                                if (buffer instanceof GridLayout || buffer instanceof Phaser.GameObjects.Container) {
                                    this.updateContainerPosition(buffer, rowIndex, colIndex);
                                } else {
                                    if (buffer != undefined)
                                        this.updateItemPosition(buffer, rowIndex, colIndex);
                                }
                            }
                        });
                    }
                }
            });
        });


        //컨테이너 위치도 조정
        this.layoutContainers();
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
                this.renderUpdateEventGrid.push(Array(this.columns).fill(undefined));
                this.hierarchicalCreateEventGrid.push(Array(this.columns).fill(undefined));
                
            }
            this.rows = requiredRows;
        }

        if (requiredCols > this.columns) {
            for (let i = 0; i < this.rows; i++) {
                this.grid[i].length = requiredCols; // 각 행에 열을 추가
                this.renderUpdateEventGrid[i].length = requiredCols;
                this.hierarchicalCreateEventGrid[i].length = requiredCols;
            }
            this.columns = requiredCols;
        }
    }


    private getObjectAt(gameObject: acceptableObject): { row: number, col: number, object: callbackRenderUpdateObject, objectAll?: callbackRenderUpdateObject | callbackRenderUpdateObject[] } | undefined {
        // grid에서 해당 gameObject가 위치한 row, col을 찾음
        let row = -1;
        let col = -1;
        let targetAll = undefined;
        let targetObject = undefined;

        // this.grid에서 해당 gameObject를 찾아 그 위치(row, col)를 찾습니다.
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {



                if (Array.isArray(this.grid[r][c])) {
                    if (Array.isArray(this.grid[r][c])) {

                        const arr = this.grid[r][c] as acceptableObject[];

                        // if (this.name == 'grid_inGameGridLayer') {
                        //     console.log("뻐킹 살라미", this.grid[r][c], [gameObject], (this.grid[r][c] as acceptableObject[]).includes(gameObject));
                            
                        //     let xxx = false;
                        //     (this.grid[r][c] as acceptableObject[]).forEach((element) => {
                        //         if (element === undefined) return;
                        //         console.log("뻐킹 살라미", this.name, gameObject.name, element.name);
                        //         if (gameObject === element) {
                        //             xxx = true;
                        //         }
                        //     });

                        //     if (xxx) {
                        //         console.log("찾은적 있음!");
                        //     } else [
                        //         console.log("찾은적 없음!")
                        //     ]

                        
                        // }
                        

                        if (arr.includes(gameObject)) {
                            row = r;
                            col = c;
                            targetObject = gameObject;
                        }

                        if (targetObject != undefined) {
                            targetAll = this.grid[r][c];
                            break;
                        }
                    }
                } else if (this.grid[r][c] === gameObject) {
                    row = r;
                    col = c;
                    targetObject = gameObject;
                    break;
                }
            }
            if (row !== -1 && col !== -1) break; // 찾았으면 바로 종료
        }

        // gameObject가 grid에 없을 경우
        if (row === -1 || col === -1) {
            console.error("The specified gameObject is not found in the grid.", gameObject);
            return undefined;
        }

        return { row, col, object: targetObject, objectAll: targetAll };
    }


    /**
     * 그리드에서 객체의 위치를 재조정하기 위한 메서드
     * 단일 그리드의 위치를 재조정합니다
     * @param gameObject 
     * @param row 
     * @param col 
     */
    updateItemPosition(gameObject: gameObject, row: number, col: number) {
        let width = 0;
        let height = 0;
        let debugObjectType = '';
    
        // 텍스트, 이미지, 스프라이트 객체만 width와 height를 가짐
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
    
        // 지정된 셀 크기 가져오기
        const cell = this.getCellSize();
        const screen = this.getScreenSize();
    
        let newX = 0;
        let newY = 0;
    
        // 🔥 **각 row 및 col의 최대 크기 저장 (앞의 요소가 크다면 뒤에도 영향)**
        let maxColWidth: number[] = Array(this.columns).fill(cell.width);
        let maxRowHeight: number[] = Array(this.rows).fill(cell.height);
    
        // 🔹 **1차 루프: 현재까지 가장 큰 row/col 크기 계산**
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {
                const specifiedSize = this.getSpecifiedGridSize({ pos: { row: r, col: c } });
                const currentWidth = specifiedSize?.size?.width ?? cell.width;
                const currentHeight = specifiedSize?.size?.height ?? cell.height;
    
                // 🔥 현재 row/col에서 가장 큰 크기 업데이트
                maxColWidth[c] = Math.max(maxColWidth[c], currentWidth);
                maxRowHeight[r] = Math.max(maxRowHeight[r], currentHeight);
            }
        }
    
        // 🔹 **2차 루프: 새로운 위치 계산**
        for (let c = 0; c < col; c++) {
            newX += maxColWidth[c];  // 🔥 **앞 col이 크다면, 이후 col이 밀림**
        }
        for (let r = 0; r < row; r++) {
            newY += maxRowHeight[r];  // 🔥 **앞 row가 크다면, 이후 row가 밀림**
        }
    
        // 현재 위치의 크기 결정
        let finalWidth = maxColWidth[col];
        let finalHeight = maxRowHeight[row];
    
        // 화면을 넘지 않도록 비율 조정
        const maxCellWidth = screen.width / this.columns;
        const maxCellHeight = screen.height / this.rows;
    
        const scaleX = Math.min(maxCellWidth / finalWidth, 1);
        const scaleY = Math.min(maxCellHeight / finalHeight, 1);
    
        finalWidth *= scaleX;
        finalHeight *= scaleY;
    
        // 🔹 **최종 위치 설정 및 크기 조정**
        if (gameObject instanceof Phaser.GameObjects.Sprite ||
            gameObject instanceof Phaser.GameObjects.Image ||
            gameObject instanceof Phaser.GameObjects.Text) {
            gameObject.setPosition(newX + this.spacing, newY + this.spacing);
            gameObject.setScale(scaleX, scaleY);
        }
    
        // 렌더링 업데이트 이벤트 호출
        this.callEventRenderUpdate(gameObject, col, row);
    }
    
    private updateContainerPosition(container: containerObject, row: number, col: number) {
        let newX = 0;
        let newY = 0;
        let cellWidth = 0;
        let cellHeight = 0;
    
        // If col > 0, calculate the cellWidth for columns before the current one.

        for (let c = 0; c < col; c++) {
            if (c === 0) {
                cellWidth = 0;
            } else {
                const specifiedSize = this.getSpecifiedGridSize({ pos: { row, col: c } });
                cellWidth = specifiedSize?.size?.width ?? (this.getScreenSize().width / this.columns);
            }
            newX += cellWidth;
        }
    
    
        // If row > 0, calculate the cellHeight for rows before the current one.

        for (let r = 0; r < row; r++) {
            
            if (r === 0) {
                cellHeight = 0;
            } else {
                const specifiedSize = this.getSpecifiedGridSize({ pos: { row: r, col } });
                cellHeight = specifiedSize?.size?.height ?? (this.getScreenSize().height / this.rows);
            }
            newY += cellHeight;
        }
        
    
        // Apply spacing after accumulating the necessary values
        container.setPosition(newX + this.spacing, newY + this.spacing);
    
        this.callEventRenderUpdate(container, col, row);
    }
    
    
    
    // 그리드 내 모든 컨테이너와 GridLayout의 위치를 새로 배치합니다.
    layoutContainers() {
        this.grid.forEach((row, rowIndex) => {
            row.forEach((gameObject, colIndex) => {
                if (gameObject instanceof Phaser.GameObjects.Container || gameObject instanceof GridLayout) {
                    this.updateContainerPosition(gameObject, rowIndex, colIndex);
                }
            });
        });
    }

    
    // 특정 GameObject나 Container가 속한 그리드 셀의 절대 좌표와 크기를 얻는 메서드
    getSizeOfObject(gameObject: Phaser.GameObjects.GameObject, spacing: boolean = false) {
        const objectAt = this.getObjectAt(gameObject);
        if (!objectAt) return null;
    
        let newX = 0;
        let newY = 0;
        let cellWidth = 0;
        let cellHeight = 0;
    
        for (let c = 0; c <= objectAt.col; c++) {
            const specifiedSize = this.getSpecifiedGridSize({ pos: { row: objectAt.row, col: c } });
            cellWidth = specifiedSize?.size?.width ?? (screen.width / this.rows);
            if (c < objectAt.col) newX += cellWidth;
        }
    
        for (let r = 0; r <= objectAt.row; r++) {
            const specifiedSize = this.getSpecifiedGridSize({ pos: { row: r, col: objectAt.col } });
            cellHeight = specifiedSize?.size?.height ?? (screen.height / this.rows);
            if (r < objectAt.row) newY += cellHeight;
        }
    

        return {
            objectAt: objectAt,
            x: newX + (spacing ? this.spacing : 0),
            y: newY + (spacing ? this.spacing : 0),
            w: cellWidth - (spacing ? this.spacing : 0),
            h: cellHeight - (spacing ? this.spacing : 0),
        };
    }
    

    getCellBoundsByObject(gameObject: Phaser.GameObjects.GameObject, spacing: boolean = false) {
        const objectAt = this.getObjectAt(gameObject);
        if (!objectAt) return null;

        const cell = this.getCellSize();

        let newX = 0;
        let newY = 0;
        let cellWidth = 0;
        let cellHeight = 0;
    
        for (let c = 0; c <= objectAt.col; c++) {
            const specifiedSize = this.getSpecifiedGridSize({ pos: { row: objectAt.row, col: c } });
            cellWidth = specifiedSize?.size?.width ?? cell.width;
            if (c < objectAt.col) newX += cellWidth;
        }
    
        for (let r = 0; r <= objectAt.row; r++) {
            const specifiedSize = this.getSpecifiedGridSize({ pos: { row: r, col: objectAt.col } });
            cellHeight = specifiedSize?.size?.height ?? cell.height;
            if (r < objectAt.row) newY += cellHeight;
        }
    
        return {
            topLeft: { x: newX + (spacing ? this.spacing : 0), y: newY + (spacing ? this.spacing : 0) },
            topRight: { x: newX + cellWidth - (spacing ? this.spacing : 0), y: newY + (spacing ? this.spacing : 0) },
            bottomLeft: { x: newX + (spacing ? this.spacing : 0), y: newY + cellHeight - (spacing ? this.spacing : 0) },
            bottomRight: { x: newX + cellWidth - (spacing ? this.spacing : 0), y: newY + cellHeight - (spacing ? this.spacing : 0) },
        };
    }

    // 각 그리드 셀의 좌상, 우상, 좌하, 우하 절대값 계산
    getCellBoundsByPos(row: number, col: number, spacing: boolean = false) {
        let newX = 0;
        let newY = 0;
        let cellWidth = 0;
        let cellHeight = 0;
    
        for (let c = 0; c <= col; c++) {
            const specifiedSize = this.getSpecifiedGridSize({ pos: { row, col: c } });
            cellWidth = specifiedSize?.size?.width ?? (screen.width / this.rows);
            if (c < col) newX += cellWidth;
        }
    
        for (let r = 0; r <= row; r++) {
            const specifiedSize = this.getSpecifiedGridSize({ pos: { row: r, col } });
            cellHeight = specifiedSize?.size?.height ?? (screen.height / this.rows);
            if (r < row) newY += cellHeight;
        }
    
        return {
            topLeft: { x: newX + (spacing ? this.spacing : 0), y: newY + (spacing ? this.spacing : 0) },
            topRight: { x: newX + cellWidth - (spacing ? this.spacing : 0), y: newY + (spacing ? this.spacing : 0) },
            bottomLeft: { x: newX + (spacing ? this.spacing : 0), y: newY + cellHeight - (spacing ? this.spacing : 0) },
            bottomRight: { x: newX + cellWidth - (spacing ? this.spacing : 0), y: newY + cellHeight - (spacing ? this.spacing : 0) },
        };
    }
    
    private getScreenSize() {
        const { width: screenWidth, height: screenHeight } = this.scene.scale;
        return { width: screenWidth, height: screenHeight };
    }


    // 그리드 셀의 너비와 높이를 계산하여 반환하는 메서드
    //spacing 값을 계산하지 않음.
    getCellSize() {
        // 화면 크기 가져오기
        const screen = this.getScreenSize();

        // 그리드 셀의 크기 계산
        const cellWidth = screen.width / this.columns;
        const cellHeight = screen.height / this.rows;
        

        return { width: cellWidth, height: cellHeight};
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

    getGrid() {
        return this.grid;
    }

}

export type { GridLayout };

// 레이어 컨테이너 생성 함수
export default function createLayerContainer(scene: Phaser.Scene, layerName: string, spacing?: number, initX?: number, initY?: number): GridLayout {
    const layerContainer = new GridLayout(scene, initY, initX,spacing); // GridLayout으로 확장된 컨테이너 생성
    layerContainer.name = layerName;
    return layerContainer;
}
