"use strict";

angular.module("AngularGL.Buffers", []);

function Buffer(data, type) {
    this.data = data || [];
    this.type = type;
    switch(this.type) {
        case "position":
            this.itemSize = 3;
            break;
        case "color":
            this.itemSize = 4;
            break;
        case "texture":
            this.itemSize = 2;
            break;
        case "element":
            this.itemSize = 1;
            break;
    }
}
Buffer.prototype.bind = function(rctx) {
    if(this.bound) return;
    console.log("Binding %s buffer", this.type);
    this.webGLBuffer = rctx.createBuffer();
    if(this.type === "element") {
        rctx.bindBuffer(rctx.ELEMENT_ARRAY_BUFFER, this.webGLBuffer);
        rctx.bufferData(rctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.data), rctx.STATIC_DRAW);
    } else {
        rctx.bindBuffer(rctx.ARRAY_BUFFER, this.webGLBuffer);
        rctx.bufferData(rctx.ARRAY_BUFFER, new Float32Array(this.data), rctx.STATIC_DRAW);
    }
    if(this.type === "texture") {
        this.image.onload = (function(buffer) {
            return function() {
                buffer.texture.resolve(buffer.loadFn(rctx));
            };
        })(this);
        this.image.src = this.path;
    }
    this.bound = true;
};
Buffer.prototype.rebind = function(canvas, matrices) {
    if(this.type === "element") return;
    var deferred = this.q.defer();
    var rctx = canvas.rctx;
    var program = canvas.program;
    //Rebind buffer and set vertex attrib pointer
    rctx.bindBuffer(rctx.ARRAY_BUFFER, this.webGLBuffer);
    rctx.vertexAttribPointer(program.vertexAttributes[this.type], this.itemSize, rctx.FLOAT, false, 0, 0);
    //TODO: check if rest of function must be included in previous if statement
    if(this.type === "texture") {
        this.texture.promise.then((function(buffer) {
            return function(texture) {
                console.log("TextureBuffer resolved");
                rctx.activeTexture(rctx.TEXTURE0);
                rctx.bindTexture(rctx.TEXTURE_2D, texture);
                rctx.uniform1i(program.samplerUniform, 0);
                deferred.resolve(buffer);
                //Set matrix uniforms
                /*mat4.setMatrixUniforms(rctx, program, matrices);
                console.log("drawArrays inside texture promise");
                rctx.clearColor.apply(rctx, canvas.background);
                rctx.drawArrays(rctx.TRIANGLE_STRIP, 0, buffer.numItems);*/
            }
        })(this));
    } else {
        console.log("%sBuffer resolved", _(this.type).capitalize());
        deferred.resolve(this);
    }
    return deferred.promise;
};
Object.defineProperty(Buffer.prototype, "numItems", {
    get: function() {
        return this.data.length / this.itemSize;
    }
});
//Inject $q service in Buffer class
angular.injector(["ng"]).invoke(["$q", function(q) {
    Buffer.prototype.q = q;
}]);
//Buffer types
Buffer.position = PositionBuffer;
Buffer.color = ColorBuffer;
Buffer.texture = TextureBuffer;
Buffer.element = ElementBuffer;

function PositionBuffer(data) {
    Buffer.call(this, data, "position");
}
PositionBuffer.prototype = Object.create(Buffer.prototype);
PositionBuffer.prototype.constructor = PositionBuffer;

function ColorBuffer(data) {
    Buffer.call(this, data, "color");
}
ColorBuffer.prototype = Object.create(Buffer.prototype);
ColorBuffer.prototype.constructor = ColorBuffer;
ColorBuffer.prototype.createData = function(color) {
    var data = [];
    for(var i=0; i < this.numItems; i++) {
        [].push.apply(data, _.template(color, [0, 0, 0, 1]));
    }
    return data;
};

function TextureBuffer(texturePath, numVertices, factor) {
    Buffer.call(this, [], "texture");
    factor = factor || 1;
    for(var i=0; i < numVertices; i++) {
        this.data = this.data.concat(_.chain(i.toString(2)).pad(2, "0").chars().map(function(str) {
            return _(str).toNumber() * factor;
        }).value());
    }
    this.texture = this.q.defer();
    this.image = new Image();
    this.path = texturePath;
    this.loadFn = function(rctx) {
        var method = 1;
        //Method n. 1 is the one illustrated on learningwebgl.com, lesson5, function handleLoadedTexture()
        //Method n. 2 is the one illustrated on lesson "Using textures in WebGL", http://snipurl.com/299a1r3
        //Neither work :(
        var texture = rctx.createTexture();
        rctx.bindTexture(rctx.TEXTURE_2D, texture);
        if(method === 1) {
            rctx.pixelStorei(rctx.UNPACK_FLIP_Y_WEBGL, true);
        }
        rctx.texImage2D(rctx.TEXTURE_2D, 0, rctx.RGBA, rctx.RGBA, rctx.UNSIGNED_BYTE, this.image);
        rctx.texParameteri(rctx.TEXTURE_2D, rctx.TEXTURE_MAG_FILTER, (method === 1)? rctx.NEAREST : rctx.LINEAR);
        rctx.texParameteri(rctx.TEXTURE_2D, rctx.TEXTURE_MIN_FILTER, (method === 1)? rctx.NEAREST : rctx.LINEAR_MIPMAP_NEAREST);
        if(method === 2) {
            rctx.generateMipmap(rctx.TEXTURE_2D);
        }
        rctx.bindTexture(rctx.TEXTURE_2D, null);
        return texture;
    }
}
TextureBuffer.prototype = Object.create(Buffer.prototype);
TextureBuffer.prototype.constructor = TextureBuffer;

function ElementBuffer(data) {
    Buffer.call(this, data, "element");
}
ElementBuffer.prototype = Object.create(Buffer.prototype);
ElementBuffer.prototype.constructor = ElementBuffer;