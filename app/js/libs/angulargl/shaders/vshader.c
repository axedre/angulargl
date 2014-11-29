uniform vec3 color;
uniform vec3 pointLightPosition;

uniform float d; /* Distance between bands */
uniform float r; /* Roughness parameter */
uniform float C; /* Shape parameter */

attribute vec3 aTangent;

varying vec3 vColor;

vec3 blend3 (in vec3 x) {
    vec3 y = vec3(1.0 - x * x);
    y = max(y, vec3(0));
    return y;
}

void main() {
    vec3 P = (modelViewMatrix * vec4(position, 1.0)).xyz;
    vec3 L = normalize(pointLightPosition - P);
    vec3 V = normalize(cameraPosition - P);
    vec3 H = L + V;
    vec3 N = normalMatrix * normal;
    vec3 T = normalMatrix * aTangent;
    float u = dot(T, H) * d;
    float w = dot(N, H);
    float e = r * u / w;
    float c = exp(-e * e);

    vec3 anis = color * vec3(c); /*hiliteColor * vec4(c.x, c.y, c.z, 1);*/

    if(u < 0.0) {
        u = -u;
    }

    const float M = 8.0;

    vec3 cdiff = vec3(0);

    for (float n = 1.0; n < M; n+=1.0) {
        float y = 2.0 * u / n - 1.0;
        cdiff.xyz += blend3(vec3(C * (y - 0.75), C * (y - 0.5), C * (y - 0.25)));
    }
    vColor = cdiff + anis;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
