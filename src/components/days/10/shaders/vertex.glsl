#version 300 es
uniform mat4 u_matrix;
uniform vec2 u_range_min;
uniform vec2 u_range_max;
uniform float u_time;
uniform vec3 u_color_balance;
uniform vec3 u_rotation_balance;
uniform int u_split_number;
in vec2 a_pos;
out vec2 v_pos;
out vec2 v_range_min;
out vec2 v_range_max;
out vec3 v_color_balance;
out vec3 v_rotation_balance;
flat out int v_split_number;
out float time;
void main() {
    time = u_time;
    v_pos = (a_pos - u_range_min) / (u_range_max - u_range_min);
    v_color_balance = u_color_balance;
    v_split_number = u_split_number;

    gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);
}