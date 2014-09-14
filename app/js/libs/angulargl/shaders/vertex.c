attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec2 aVertexTexture;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec4 vColor;
varying vec2 vTexture;

void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vColor = aVertexColor;
    vTexture = aVertexTexture;
}