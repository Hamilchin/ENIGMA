#version 300 es

layout(location = 0) in vec3 aNormal;
layout(location = 1) in vec2 aTexCoord;
layout(location = 2) in float aDepth;
layout(location = 3) in vec3 aCoords;
layout(location = 4) in vec3 aCoords1;

uniform mat4 modelviewProjection;
uniform mat4 normalMatrix;
uniform mat4 lightPovMvp;

uniform float alpha;
uniform int frameA;
uniform int frameB;
vec4 keyframes[2];

out vec2 vTexCoord;
out float vDepth;
out vec3 vNormal;
out mat4 vNormalMatrix;
out vec4 positionFromLightPov;

void main() {
    keyframes[0] = vec4(aCoords, 1.0);
    keyframes[1] = vec4(aCoords1, 1.0);

    vec4 coords = mix(keyframes[frameA], keyframes[frameB], alpha);
    gl_Position = modelviewProjection * coords;

    vTexCoord = aTexCoord;
    vDepth = aDepth;
    vNormal = aNormal;
    vNormalMatrix = normalMatrix;
    positionFromLightPov = lightPovMvp * coords;
}
