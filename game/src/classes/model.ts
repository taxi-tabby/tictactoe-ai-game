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

    public async predict(key: string, boardState: number[]): Promise<number> {
        const model = this.models.get(key);
        if (!model) {
            throw new Error(`Model with key ${key} not found`);
        }
        const inputTensor = tf.tensor2d([boardState], [1, 9]);
        const prediction = model.predict(inputTensor) as tf.Tensor;
        const predictedMove = (await prediction.argMax(-1).data())[0];
        return predictedMove;
    }
}
