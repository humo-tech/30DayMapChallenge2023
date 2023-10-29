attribute vec3 position;

void main (void) {
    gl_Position = vec4(position, 1.0);
    gl_PointSize = 10.0;
}