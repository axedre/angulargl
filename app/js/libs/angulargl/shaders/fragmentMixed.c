precision mediump float;

varying vec4 vColor;
varying vec2 vTexture;

uniform sampler2D uSampler;

void main(void) {
    gl_FragColor = vColor + texture2D(uSampler, vec2(vTexture.x, vTexture.y));
}