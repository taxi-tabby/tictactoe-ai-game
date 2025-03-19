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
    primary: '#6D8C8F',  // Pastel Teal (a lighter tone of #02343F)
    secondary: '#F1E2B3',  // Pastel Light Yellow (a softer version of #F0EDCC)
    primaryVariant: '#6A8F91',  // Pastel Teal Variant (a lighter version of #1A6373)
    secondaryVariant: '#D1D18F',  // Pastel Olive (a softer variant of #BDB98E)

    /**
     * Background color
     * @description
     * - main: Main background color
     * - paper: game
     */
    background: {
        main: [
            '#6D8C8F'  // Pastel Teal (a lighter tone of #02343F)
        ],
        game: [
            '#6D8C8F'  // Pastel Teal (a lighter tone of #02343F)
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
        error: '#F0A0A0',  // Pastel Red (a softer version of #B00020)
        warning: '#F2B24D',  // Pastel Yellow-Orange (a lighter version of #F28705)
        point: '#F5D255',  // Pastel Yellow (a soft version of #F2CB05)
        success: '#7BAA8A'  // Pastel Green (a lighter version of #267365)
    }
}
