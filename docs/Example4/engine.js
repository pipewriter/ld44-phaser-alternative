window.UNITS_WIDE = 16/9;
window.UNITS_TALL = 1;


const addTagToHead = ({tag, attributes, innerContent}) => {
    const outer = document.createElement(tag);
    let inner;
    if (typeof innerContent === 'string') {
        inner = document.createTextNode(innerContent);
    } else {
        inner = innerContent;
    }
    outer.appendChild(inner);
    return outer;
}

const styleTag = addTagToHead({
    tag: 'style',
    innerContent: `
    html, body{
        margin: 0px;
        padding: 0px;
        background-color: rgba(0.8, 0.8, 0.8, 0.8);
        width: 100%;
        height: 100%;
        
        user-select:none;
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
    }
    #shell, #shell > * {
        position: absolute;
    }
    
    #shell > * {
        width: 100%;
        height: 100%;
        top: 0px;
        left: 0px;
    }
    
    #canvas {
        background: black;
    }
    `
})
document.head.appendChild(styleTag);

document.body.innerHTML = `
<div id="shell" draggable="false">
    <canvas id="canvas" width="512" height="512">
        Your browser does not support the HTML5 canvas tag.
    </canvas>
</div>` + document.body.innerHTML;
 
/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */
/** initialize-canvas.js */
/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */
/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */
/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */

window.GAME = {};

(function createCanvas(){
    window.GAME.canvas = document.getElementById("canvas");
    const shell = document.getElementById('shell');
    const aspectX = 16;
    const aspectY = 9;
    let mouseX = 0;
    let mouseY = 0;
    let mousedown = false;
    window.GAME.getMousePos = function getMousePos(){
        return {x: mouseX, y: mouseY};
    }
    window.GAME.getMouseDown = function getMouseDown(){
        return mousedown;
    }
    let filter;
    function setFilterVars({offsetX, offsetY, width, height}){
        filter = {offsetX, offsetY, width, height};
        window.GAME.windowInfo = filter;
    }
    function setMousePos({x: curMX, y: curMY}){
        mouseX = (curMX) / filter.width;
        mouseY = (curMY) / filter.height;
    }
    function setCanvasToSize(width, height){
        
        let values = {
            width,
            height
        };

        const calc = width * aspectY - height * aspectX;
        values.offsetX = 0;
        values.offsetY = 0;
        if(calc > 0){
            values.gameWidth = height * aspectX / aspectY;
            values.gameHeight = height;
            values.offsetX = (width - values.gameWidth)/2;
        } else {
            values.gameWidth = width;
            values.gameHeight = width * aspectY / aspectX;
            values.offsetY = (height - values.gameHeight)/2;

        }
        const {gameWidth, gameHeight, offsetX, offsetY} = values;
        shell.style.width = gameWidth + 'px';
        shell.style.height = gameHeight + 'px';
        shell.style.left = offsetX + 'px';
        shell.style.top = offsetY + 'px';

        const {canvas} = window.GAME;
        canvas.width = gameWidth;
        canvas.height = gameHeight;

        setFilterVars(values);
    };
    setCanvasToSize(window.innerWidth, window.innerHeight);
    window.addEventListener("resize", function windowResize(resizeEvent){
        const {innerHeight:height, innerWidth:width} = resizeEvent.currentTarget || {};
        setCanvasToSize(width, height);
    });
    window.onmousemove = (event) => {
        setMousePos({x: event.clientX, y: event.clientY});
    };
    window.onmousedown = (event) => {
        mousedown = true;
    }
    window.onmouseup = (event) => {
        mousedown = false;
    }
})();

/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */
/** initialize-webgl.js */
/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */
/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */
/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */


window.initializeWebGL = (function initializeWebGL(){
    gl = window.GAME.canvas.getContext("webgl");
    gl.clearColor(0,0,0,1.0);
    gl.clearDepth(1.0);
    // gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    window.gl = gl;
})();


/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */
/** utils.js */
/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */
/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */
/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */

// example: makeRequest('GET', 'http://example.com');
(function utils() {
    window.utils = {};
    window.utils.makeRequest = function makeRequest(method, url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send();
        });
    }

    window.utils.loadImageElement = function loadImageElement(url) {
        return new Promise(function (resolve, reject) {
            const image = new Image();
            image.onload = function () {
                resolve(image);
            }
            image.src = url;
        });
    }
})();


/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */
/** renderingStrategyImage.js */
/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */
/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */
/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */

const imgConfig = {
    vertFile: "imgVert.glsl",
    fragFile: "imgFrag.glsl",
    imageUrl: "guy.png",
    vertAttributes: [
        {
            handle: "vertPos",
            size: 3
        },
        {
            handle: "vertColor",
            size:3
        },
        {
            handle: "textureCord",
            size: 2
        }
    ]
}

async function initializeImageFromConfig({vertFile, fragFile, imageUrl, vertAttributes}){
    let gl = window.gl;
    let [/*vertCode, fragCode, */ imageEl] = await Promise.all([
        // window.utils.makeRequest("GET", vertFile),
        // window.utils.makeRequest("GET", fragFile),
        window.utils.loadImageElement(imageUrl)
    ]);

    const vertCode = `precision mediump float;

    attribute vec3 vertPos; 
    attribute vec2 textureCord;
    
    const vec2 aspect = vec2(16.0, 9.0);
    
    varying vec2 fragTex;
    
    void main(void) {
        fragTex = textureCord;
        vec3 adjPos = vec3(((vertPos.x*aspect.y/aspect.x)*2.0-1.0), (-vertPos.y*2.0+1.0), vertPos.z);
        gl_Position = vec4(adjPos, 1.0);
    }`;

    const fragCode = `precision mediump float;

    varying vec2 fragTex;
    
    uniform sampler2D uSampler;
    
    void main(void) {
        vec4 tColor = texture2D(uSampler, fragTex);
        gl_FragColor = tColor;
    }`;

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageEl);

    function isPowerOf2(value) {
        return (value & (value - 1)) == 0;
    }
    
    if (isPowerOf2(imageEl.width) && isPowerOf2(imageEl.height)) {
        // Yes, it's a power of 2. Generate mips.
        // gl.generateMipmap(gl.TEXTURE_2D); //causing weird specks on render
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    } else {
        // No, it's not a power of 2. Turn of mips and set
        // wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    
    const vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, vertCode);
    gl.compileShader(vShader);

    const fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, fragCode);
    gl.compileShader(fShader);

    if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
        throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
        gl.deleteShader(fShader);
    }
    if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
        throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
        gl.deleteShader(vShader);
    }
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, fShader);
    gl.attachShader(shaderProgram, vShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
    }

    gl.useProgram(shaderProgram);

    const vertexBuffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer1);
    const triangleBuffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer1);

    const uSampler = gl.getUniformLocation(shaderProgram, 'uSampler');

    let stride = 0;
    let offset = 0;
    vertAttributes.forEach(attrib => {
        stride += attrib.size;
        attrib.location = gl.getAttribLocation(shaderProgram, attrib.handle);
        attrib.offset = offset;
        offset += attrib.size;
    });

    return function _drawElements(vertexData, indexData){

        gl.useProgram(shaderProgram);

        gl.uniform1i(uSampler, 0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer1);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertexData),gl.STATIC_DRAW);

        for(const attrib of vertAttributes){
            gl.enableVertexAttribArray(attrib.location);
            gl.vertexAttribPointer(
                attrib.location,
                attrib.size,
                gl.FLOAT,
                false,
                stride * Float32Array.BYTES_PER_ELEMENT,
                attrib.offset * Float32Array.BYTES_PER_ELEMENT
            );
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer1);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indexData),gl.STATIC_DRAW);

        gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);
    }
};

/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */
/** drawPicture.js */
/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */
/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */
/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */

window.drawpic = {};
window.drawpic.config = {
    vertFile: "./pictureVert.glsl",
    fragFile: "./pictureFrag.glsl",
    vertAttributes: [
        {
            handle: "vertPos",
            size: 3
        },
        {
            handle: "textureCord",
            size: 2
        }
    ]
}

window.drawpic.stateSchema = {
    x: 0,
    y: 0,
    r: 0, //rotation in radians
    h: 1,
    w: 1,
}
window.drawpic.init = async function initDrawPic(imageUrl){
    let img = await initializeImageFromConfig({...window.drawpic.config, imageUrl});
    return function draw({x, y, r, h, w}){
        let dist = Math.sqrt(Math.pow(h/2, 2) + Math.pow(w/2, 2));
        let a = Math.atan2(h/2, w/2)
        let [a1, a2, a3, a4] = [
            a,
            Math.PI - a,
            a + Math.PI,
            -a
        ];
        let d1 = y + Math.sin(a1 + r)*(dist);
        let d2 = y + Math.sin(a2 + r)*(dist);
        let d3 = y + Math.sin(a3 + r)*(dist);
        let d4 = y + Math.sin(a4 + r)*(dist);
        let e1 = x + Math.cos(a1 + r)*(dist);
        let e2 = x + Math.cos(a2 + r)*(dist);
        let e3 = x + Math.cos(a3 + r)*(dist);
        let e4 = x + Math.cos(a4 + r)*(dist);
        const vd = [
            e4, d4, 0.9, 1.0, 0.0,
            e3, d3, 0.9, 0.0, 0.0,
            e2, d2, 0.9, 0.0, 1.0,
            e1, d1, 0.9, 1.0, 1.0
        ];
        const id= [0, 1, 2, 0, 2, 3];
        img(vd, id);
    }
}

window.RESET_FOR_NEXT_FRAME = () => {
    gl.viewport(0, 0, window.GAME.canvas.width, window.GAME.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}