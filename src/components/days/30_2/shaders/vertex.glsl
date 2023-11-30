#version 300 es
uniform mat4 u_matrix;
uniform vec3 u_offset;
uniform float u_time;
uniform float u_radius;
in vec3 a_pos;
out vec3 v_pos;
void main() {
    v_pos = a_pos / u_radius;
    gl_Position = u_matrix * (vec4(a_pos, 1.0) + vec4(u_offset, 0.0));
}