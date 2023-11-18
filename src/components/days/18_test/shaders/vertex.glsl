#version 300 es
uniform mat4 u_matrix;
uniform float u_alt_meter;
in vec2 a_pos;
out float time;
void main() {
    gl_Position = u_matrix * vec4(a_pos, u_alt_meter / 100000000.0, 1.0);
}