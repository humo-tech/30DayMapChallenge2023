#version 300 es
highp mat2 rotate (highp float a) {
    highp float s = sin(a);
    highp float c = cos(a);
    return mat2(c, s, -s, c);
}

in mediump float time;
in mediump vec2 v_pos;
flat in mediump int v_split_number;
in mediump vec3 v_color_balance;
in mediump vec3 v_rotation_balance;
out mediump vec4 fragColor;

void main() {
    mediump vec2 p = (v_pos * 2.0) - 1.0;
    mediump vec2 q = p;
    p *= rotate((sin(time * v_rotation_balance.x) + cos(time * v_rotation_balance.y)) * time * v_rotation_balance.z);

    for(int i=0; i<v_split_number; i++) {
      p = abs(p) - 0.3;
      p *= rotate(sin(time * 0.15));  
    }

    mediump float f = 0.0;
    f += abs(0.030 / (p.y + cos(p.x * 2.0 + time * 1.8) * 0.1));
    f += abs(0.020 / (p.y + cos(p.x * 5.1 + time * 2.0) * 0.3 - 0.1));
    f += abs(0.015 / (p.y + cos(p.x * 5.0 + time * 2.1) * 0.3 + 0.1));

    mediump float vig = 1.0 - length(q);
    mediump float alpha = 1.0 - step(1.0, length(q));

    fragColor = vec4(vec3(f * v_color_balance.r, f * v_color_balance.g, f * v_color_balance.b) * vig, alpha * 0.98);
}
