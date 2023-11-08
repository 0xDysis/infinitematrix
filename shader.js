const canvas = document.getElementById('glCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
// Vertex shader
const vsSource = `
    attribute vec4 aVertexPosition;
    void main() {
        gl_Position = aVertexPosition;
    }
`;


const fsSource = `
    precision lowp float;
    uniform vec2 iResolution;
    uniform float iTime;

    void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        vec4 fragColor;

        float s = 0.0, v = 0.0;
        vec2 uv = (fragCoord / iResolution.xy) * 2.0 - 1.;
        float time = (iTime-2.0)*58.0;
        vec3 col = vec3(0);
        vec3 init = vec3(tan(time * .0032)*.3, .35 - tan(time * .005)*.3, time * 0.0002);
        for (int r = 0; r < 50; r++) 
        {
            vec3 p = init + s * vec3(uv, 0.05);
            p.z = fract(p.z);
            for (int i=0; i < 10; i++) p = abs(p * 2.04) / dot(p, p) - .9;
            v += pow(dot(p, p), .7) * .06;
            col +=  vec3(v * 0.2+.4, 12.-s*2., .1 + v * 1.) * v * 0.00003;
            s += .025;
        }

        
        float grayscale = dot(col, vec3(0.21, 0.72, 0.07));
        col = vec3(grayscale);

        fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);

        gl_FragColor = fragColor;
    }
`;





const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vsSource);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fsSource);
gl.compileShader(fragmentShader);

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1.0, -1.0,
     1.0, -1.0,
    -1.0,  1.0,
     1.0,  1.0
]), gl.STATIC_DRAW);

gl.useProgram(shaderProgram);

const positionLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

const iResolutionLocation = gl.getUniformLocation(shaderProgram, 'iResolution');
gl.uniform2f(iResolutionLocation, gl.drawingBufferWidth, gl.drawingBufferHeight);

const iTimeLocation = gl.getUniformLocation(shaderProgram, 'iTime');
let startTime = Date.now();
function render() {
    let currentTime = Date.now();
    gl.uniform1f(iTimeLocation, (currentTime - startTime) / 1000); // time in seconds
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
}
render();
