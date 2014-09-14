"use strict";

angular.module("AngularGL.Objects", []);

function CanvasObject() {
    this.buffers = {};
}
CanvasObject.prototype.bindBuffers = function(rctx) {
    if(this instanceof Solid) {
        //Call recursively on faces (Shapes)
        _.invoke(this.faces, "bindBuffers", rctx);
    }
    _.invoke(this.buffers, "bind", rctx);
    return this; //to allow chaining
};
CanvasObject.prototype.setTexture = function(texturePath, factor) {
    if(this instanceof Solid) {
        _.invoke(this.faces, "setTexture", texturePath, factor);
        //TODO: create a single TextureBuffer for all faces
    } else {
        this.buffers.texture = new TextureBuffer(texturePath, this.vertices.length, factor);
    }
    return this; //to allow chaining
};
angular.injector(["ng"]).invoke(["$q", function(q) {
    CanvasObject.prototype.q = q;
}]);

function Shape(vertices) {
    CanvasObject.apply(this, arguments);
    this.vertices = [];
    _.each(vertices, function(vertex) {
        this.vertices.push(new Vertex());
    }, this);
    _.extend(this.buffers, {
        position: new PositionBuffer(_.reduce(_.pluck(vertices, "position"), function(v, a) {
            return v.concat(_.template(a, [0, 0, 0]));
        }, [])),
        color: new ColorBuffer(_.reduce(_.pluck(vertices, "color"), function(v, a) {
            return v.concat(_.template(a, [0, 0, 0, 1]));
        }, []))
    });
}
Shape.prototype = Object.create(CanvasObject.prototype);
Shape.prototype.constructor = Shape;
Shape.prototype.draw = function(canvas, matrices) {
    var rctx = canvas.rctx;
    var program = canvas.program;
    var deferred = this.q.defer();
    //Loop shape buffers
    this.q.all(_.invoke(this.buffers, "rebind", canvas, matrices)).then((function(shape) {
        return function() {
            console.log("Ready to draw");
            //Disable unused vertex attributes
            _.each(program.vertexAttributes, function(i, vertexAttributeType) {
                if(!rctx.getVertexAttrib(i, rctx.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING)) {
                    console.log("Attribute %d is unused, disabling", i);
                    rctx.disableVertexAttribArray(i);
                }
            });
            //Set matrix uniforms
            mat4.setMatrixUniforms(rctx, program, matrices);
            //Draw arrays
            rctx.drawArrays(rctx.TRIANGLE_STRIP, 0, shape.vertices.length);
            deferred.resolve(shape);
        };
    })(this));
    return deferred.promise;
};

function Solid(faces, elementArray) {
    CanvasObject.apply(this, arguments);
    this.faces = [];
    this.setElementArray(elementArray);
    _.each(faces, function(face) {
        this.faces.push(new Shape(face));
    }, this);
}
Solid.prototype = Object.create(CanvasObject.prototype);
Solid.prototype.constructor = Solid;
Solid.prototype.setElementArray = function(elementArray) {
    if(elementArray) {
        this.elementArray = elementArray;
        this.buffers.element = new ElementBuffer(this.elementArray);
    }
    return this; //to allow chaining
};
Solid.prototype.draw = function(canvas, scope) {
    _.invoke(this.faces, "draw", canvas, scope, !!this.elementArray);
    if(this.elementArray) {
        var rctx = canvas.rctx;
        rctx.drawElements(rctx.TRIANGLES, this.buffers[0].numItems, rctx.UNSIGNED_SHORT, 0);
    }
};

function Vertex() {}

function LightSource() {}