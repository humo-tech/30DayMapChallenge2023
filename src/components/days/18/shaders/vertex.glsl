#version 300 es
uniform mat4 u_matrix;
uniform float u_alt_meter;
uniform float u_time;
uniform float u_opacity;
uniform float u_contrast;
uniform int u_oct;

in vec2 a_pos;
out float v_time;
out float v_opacity;
out float v_contrast;
flat out int v_oct;

void main() {
    v_time = u_time;
    v_opacity = u_opacity;
    v_contrast = u_contrast;
    v_oct = u_oct;
    gl_Position = u_matrix * vec4(a_pos, u_alt_meter / 100000000.0, 1.0);
}