/**
 * Game color config
 * @description
 * 배열인 경우 랜덤을 의미합니다.
 * Dict(Object) 형태인 경우 함수에서 선택해서 사용하도록 되어 있습니다.
 * k-v 형태인 경우는 말이 필요 없죠?
 */
export default {

    /**
     * Theme color
     * @description
     * - primary: 기본 색상 
     * - secondary: 보조 색상
     * - primaryVariant: 기본 색상 변형
     * - secondaryVariant: 보조 색상 변형
     */
    primary: '#02343F',
    secondary: '#F0EDCC',
    primaryVariant: '#1A6373',
    secondaryVariant: '#BDB98E',


    /**
     * Background color
     * @description
     * - main: Main background color
     * - paper: game
     */
    background: {
        main: [
            '#02343F'
        ],
        game: [
            '#02343F'
        ]
    },

    /**
     * Default color for alert or etc.
     * @description
     * - error: 에러용
     * - warning: 경고용
     * - point: 강조 포인트 색성
     * - success: 성공용
     */
    default: {
        error: '#B00020',
        warning: '##F28705',
        point: '#F2CB05',
        success: '#267365'
    }
    
    

}