#version 300 es
uniform mat4 u_matrix;
uniform float u_time;
uniform vec2 u_xrange;
uniform vec2 u_yrange;
uniform vec2 u_zrange;
in vec3 a_pos;
out vec3 v_color;
void main() {
    float _x = (a_pos.x - u_xrange.x) / (u_xrange.y - u_xrange.x);
    float _y = (a_pos.y - u_yrange.x) / (u_yrange.y - u_yrange.x);
    float _z = (a_pos.z - u_zrange.x) / (u_zrange.y - u_zrange.x);

    float r = sin(u_time * 0.5 + _x);
    float g = cos(u_time * 0.5 + _y + _z);
    float b = cos(u_time * 0.5 + _z) * sin(u_time + (_x * _y));

    //v_color = vec3(_x, _y, _z);
    v_color = vec3(r, g, b);
    gl_Position = u_matrix * vec4(a_pos, 1.0);
    gl_PointSize = 5.0;
}