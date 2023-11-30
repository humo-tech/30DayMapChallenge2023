#version 300 es
//highp mat2 rotate (highp float a) {
//    highp float s = sin(a);
//    highp float c = cos(a);
//    return mat2(c, s, -s, c);
//}

uniform mediump float u_time;
in mediump vec3 v_pos;
out mediump vec4 fragColor;

void main() {
    //fragColor = vec4(vec3(cos(u_time) * v_pos.x, sin(u_time * 3.0) * v_pos.y, cos(u_time) * sin(u_time) * v_pos.z), 1.0);
    fragColor = vec4((cos(u_time) + v_pos + vec3(0.2, 0.5, 0.7)) * 0.3 + 0.3, 0.8);
}

