# Tic-Tac-Toe AI Game

This project implements a Tic-Tac-Toe game using TensorFlow Keras neural networks. The AI has been trained on 500,000 data to create a more enjoyable playing experience compared to traditional algorithms.

## Features
- AI trained with TensorFlow and Keras
- Uses **Q-learning** for AI
- Enhanced gameplay experience
- Test version trained with **200,000 samples**
- Trained on 500,000 data points
- More difficult and improved rules and UI
- UX/UI developed with **Phaser** and **React**


Enjoy playing against an AI that has been trained to provide a challenging and fun experience!

## License
This project is licensed under the MIT License.


#### ai input code
```typescript

const pre = await modelLoader.predict('4x4_4', {x: 4, y: 4}, [
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
]);
console.log('AI Prediction:', pre);

```

#### ai result
```json
{
    "0": 8.339865993759714e-27,
    "1": 1.8684799356286507e-28,
    "2": 3.494117461209062e-31,
    "3": 6.0463235242454735e-31,
    "4": 2.0979073540001083e-31,
    "5": 5.692640618460459e-27,
    "6": 1.1580877245148591e-30,
    "7": 1.2755487177343128e-26,
    "8": 4.053882717703401e-28,
    "9": 1.2461308643081145e-31,
    "10": 1,
    "11": 1.2504764263141046e-34,
    "12": 0,
    "13": 0,
    "14": 1.658343406050697e-38,
    "15": 0
}
```