"use strict";

angular.module("AngularGL.Buffers", []);

function Buffer(data) {
    this.data = data || [];
    if(this instanceof PositionBuffer) {
        this.type = "position";
        this.itemSize = 3;
    } else if(this instanceof ColorBuffer) {
        this.type = "color";
        this.itemSize = 4;
    } else if(this instanceof TextureBuffer) {
        this.type = "texture";
        this.itemSize = 2;
    } else {
        this.type = "element";
        this.itemSize = 1;
    }
}
Buffer.prototype.bind = function(rctx) {
    if(this.bound) return;
    console.log("Binding buffer");
    this.webGLBuffer = rctx.createBuffer();
    if(this instanceof ElementBuffer) {
        rctx.bindBuffer(rctx.ELEMENT_ARRAY_BUFFER, this.webGLBuffer);
        rctx.bufferData(rctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.data), rctx.STATIC_DRAW);
    } else {
        rctx.bindBuffer(rctx.ARRAY_BUFFER, this.webGLBuffer);
        rctx.bufferData(rctx.ARRAY_BUFFER, new Float32Array(this.data), rctx.STATIC_DRAW);
    }
    if(this instanceof TextureBuffer) {
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
    var deferred = canvas.q.defer();
    var rctx = canvas.rctx;
    var program = canvas.program;
    //Rebind buffer and set vertex attrib pointer
    rctx.bindBuffer(rctx.ARRAY_BUFFER, this.webGLBuffer);
    if(this.type !== "element") {
        rctx.vertexAttribPointer(program.vertexAttributes[this.type], this.itemSize, rctx.FLOAT, false, 0, 0);
    }
    //TODO: check if rest of function must be included in previous if statement
    if(this.type === "texture") {
        this.texture.promise.then((function(buffer) {
            return function(texture) {
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

function PositionBuffer(position) {
    Buffer.apply(this, arguments);
}
PositionBuffer.prototype = Object.create(Buffer.prototype);
PositionBuffer.prototype.constructor = PositionBuffer;

function ColorBuffer(color) {
    Buffer.apply(this, arguments);
}
ColorBuffer.prototype = Object.create(Buffer.prototype);
ColorBuffer.prototype.constructor = ColorBuffer;

function TextureBuffer(texturePath, numVertices, factor) {
    Buffer.apply(this, []);
    for(var i=0; i < numVertices; i++) {
        this.data = this.data.concat(_.chain(i.toString(2)).pad(2, "0").chars().map(function(str) {
            return _(str).toNumber()*(factor || 1);
        }).value());
    }
    this.texture = this.q.defer();
    this.image = new Image();
    this.path = texturePath;
    this.loadFn = function(rctx) {
        var texture = rctx.createTexture();
        rctx.bindTexture(rctx.TEXTURE_2D, texture);
        //rctx.pixelStorei(rctx.UNPACK_FLIP_Y_WEBGL, true);
        rctx.texImage2D(rctx.TEXTURE_2D, 0, rctx.RGBA, rctx.RGBA, rctx.UNSIGNED_BYTE, this.image);
        rctx.texParameteri(rctx.TEXTURE_2D, rctx.TEXTURE_MAG_FILTER, /*rctx.NEAREST*/rctx.LINEAR);
        rctx.texParameteri(rctx.TEXTURE_2D, rctx.TEXTURE_MIN_FILTER, /*rctx.NEAREST*/rctx.LINEAR_MIPMAP_NEAREST);
        rctx.generateMipmap(rctx.TEXTURE_2D);
        rctx.bindTexture(rctx.TEXTURE_2D, null);
        return texture;
    }
}
TextureBuffer.prototype = Object.create(Buffer.prototype);
TextureBuffer.prototype.constructor = TextureBuffer;

function ElementBuffer(indices) {
    Buffer.apply(this, arguments);
}
ElementBuffer.prototype = Object.create(Buffer.prototype);
ElementBuffer.prototype.constructor = ElementBuffer;