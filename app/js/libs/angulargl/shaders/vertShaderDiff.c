precision highp float;

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
uniform vec3 color;

attribute vec3 position;
attribute vec3 normal;

varying vec3 vColor;
//varying vec3 vViewPosition;

vec3 blend3 (in vec3 x) {
    vec3 y = 1 - x * x;
    y = max(y, vec3(0, 0, 0));
    return y;
}

void main() {
    /*float d = 1.0;
    float r = 1.0;
    float C = 4.0;
    vec3 tangent = vec3(1, 1, 1); //Temp, pass from program*/
    
    vColor = color;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    
    /*vec3 P = (modelViewMatrix * position).xyz;
    vec3 L = normalize(pointLightPosition - P);
    vec3 V = normalize(cameraPosition - P);
    vec3 H = L + V;
    vec3 N = normalMatrix * normal;
    vec3 T = normalMatrix * tangent;
    float u = dot(T, H) * d;
    float w = dot(N, H);
    float e = r * u / w;
    float c = exp(-e * e);
    vec4 anis = hiliteColor * vec4(c.x, c.y, c.z, 1);

    if (u < 0) u = -u;

    vec4 cdiff = vec4(0, 0, 0, 1);
    
    for (int n = 1; n < 8; n++) {
        float y = 2 * u / n - 1;
        cdiff.xyz += blend3(vec3(C * (y - 0.75), C * (y - 0.5), C * (y - 0.25)));
    }

    //colorO = cdiff + anis;
    //positionO = mul(ModelViewProjectionMatrix, position);


    vColor = cdiff + anis;//foo(color);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);*/
}

/*
void vp_Diffraction (
    in float4 position : POSITION,
    in float3 normal   : NORMAL,
    in float3 tangent  : TEXCOORD0,
    out float4 positionO : POSITION,
    out float4 colorO    : COLOR,
    uniform float4x4 ModelViewProjectionMatrix,
    uniform float4x4 ModelViewMatrix,
    uniform float4x4 ModelViewMatrixIT,
    uniform float r,
    uniform float d,
    uniform float4 hiliteColor,
    uniform float3 lightPosition,
    uniform float3 eyePosition
) {}
*/
