precision mediump float;

varying vec4 vColor;
varying vec2 vTexture;
varying vec3 vLightWeighting;

uniform sampler2D uSampler;

void main(void) {
    vec4 textureColor = vColor + texture2D(uSampler, vec2(vTexture.x, vTexture.y));
    gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a);
}
