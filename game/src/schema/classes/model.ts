import * as tf from '@tensorflow/tfjs';

export class TicTacToeAI {
    private models: Map<string, tf.LayersModel>;

    constructor() {
        this.models = new Map();
    }

    public async addModel(key: string, url: string): Promise<void> {
        try {
            const model = await tf.loadLayersModel(url);
            this.models.set(key, model);
            console.info(`Model loaded from ${url}`);
        } catch (e) {
            console.error(`Failed to load model from ${url}:`, e);
            throw new Error(`Failed to load model from ${url}`);
        }
    }

    
    
    public async predict(key: string, boardState: number[][]): Promise<number> {
        const model = this.models.get(key);
        if (!model) {
            throw new Error(`Model with key ${key} not found`);
        }
    
        // boardState를 1D 배열로 변환 (3x3 board -> 1D)
        const flatBoardState = boardState.flat();  // [1, 0, -1, 0, 1, 0, -1, 0, 1]
    
        // 1D 배열을 4D 텐서로 변환
        const input = tf.tensor4d(flatBoardState, [1, 3, 3, 1]);  // [1, 3, 3, 1] 형태로 텐서 생성
    
        // 예측 실행
        const prediction = model.predict(input) as tf.Tensor;
        
        const probabilities = await prediction.data();

        // 빈 칸 위치 찾기 (0인 칸만)
        const emptyIndices = flatBoardState
            .map((value, index) => (value === 0 ? index : -1)) // 0인 빈 칸만 찾기
            .filter(index => index !== -1);  // -1인 인덱스를 제외

        // 빈 칸에 해당하는 확률들만 필터링
        const emptyProbabilities = emptyIndices.map(index => probabilities[index]);

        // console.log('emptyIndices: ', emptyIndices);
        console.log('probabilities: ', probabilities);



        let predictedMove: number;

        // Epsilon-Greedy 방식 적용
        const epsilon = 0.1; // 탐험(exploration) 확률
        if (Math.random() < epsilon) {
            console.log("랜덤");
            // 무작위로 빈 칸 중 하나 선택
            const randomIndex = Math.floor(Math.random() * emptyIndices.length);
            predictedMove = emptyIndices[randomIndex];
        } else {
            console.log("높은 확률");
            // 빈 칸에서 가장 높은 확률의 위치 찾기
            const maxProbability = Math.max(...emptyProbabilities);  // 가장 높은 확률
            const maxProbabilityIndex = emptyProbabilities.indexOf(maxProbability);  // 해당 확률의 인덱스
            predictedMove = emptyIndices[maxProbabilityIndex];
        }

        return predictedMove;
    }
    
    public async trainModel(key: string, trainingData: { boardState: number[][], action: number, reward: number }[]): Promise<void> {
        const model = this.models.get(key);
        if (!model) {
            throw new Error(`Model with key ${key} not found`);
        }

        const inputs: number[][][] = [];
        const targets: number[][] = [];

        for (const data of trainingData) {
            const { boardState, action, reward } = data;

            console.log(boardState, action, reward);

            // boardState를 1D 배열로 변환 (3x3 board -> 1D)
            const flatBoardState = boardState.flat();  // [1, 0, -1, 0, 1, 0, -1, 0, 1]
            inputs.push([flatBoardState]);

            // 현재 상태에서의 예측값
            const inputTensor = tf.tensor4d(flatBoardState, [1, 3, 3, 1]);
            const prediction = model.predict(inputTensor) as tf.Tensor;
            const qValues = await prediction.data();

            // Q-러닝 업데이트
            qValues[action] = reward;
            targets.push(Array.from(qValues));

            inputTensor.dispose();
        }

        // 업데이트된 Q-값으로 모델 훈련
        const flattenedInputs = inputs.map(board => board.flat(2));
        const inputTensor = tf.tensor4d(flattenedInputs.flat(), [inputs.length, 3, 3, 1]);
        const targetTensor = tf.tensor2d(targets);
        model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
        await model.fit(inputTensor, targetTensor, {
            epochs: 21,
            shuffle: true,
            callbacks: {
            onEpochEnd: (epoch, logs) => {
                if (logs) {
                    console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
                }
            }
            }
        });

        inputTensor.dispose();
        targetTensor.dispose();
    }

}
