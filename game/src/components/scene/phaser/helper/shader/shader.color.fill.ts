// vertexShader
export const vertexShader = `
// vertexShader
attribute vec2 aVertexPosition; 
attribute vec2 aTextureCoord;   

varying vec2 vTextureCoord; 

void main(void) {
    gl_Position = vec4(aVertexPosition, 0.0, 1.0); 
    vTextureCoord = aTextureCoord; 
}

`;

// fillTargetColorToAnotherColor
export const fillTargetColorToAnotherColor = `
// fillTargetColorToAnotherColor
precision mediump float;

uniform vec3 fillColor;  // 채울 색상 (예: 빨간색)

void main(void) {
    gl_FragColor = vec4(fillColor, 1.0);  // 지정한 색상으로 전체 화면을 채움
}

`;
