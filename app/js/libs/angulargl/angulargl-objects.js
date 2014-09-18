"use strict";

angular.module("AngularGL.Objects", []);

function CanvasObject() {
    this.buffers = {};
}
CanvasObject.prototype.bindBuffers = function(rctx) {
    _.invoke(this.buffers, "bind", rctx);
};
CanvasObject.prototype.setTexture = function(texturePath, factor) {
    //TODO: Move to subclasses
    if(this instanceof Solid) {
        _.invoke(this.faces, "setTexture", texturePath, factor);
        //TODO: create a single TextureBuffer for all faces
    } else {
        this.buffers.texture = new TextureBuffer(texturePath, this.vertices.length, factor);
        delete this.buffers.color;
    }
    return this; //to allow chaining
};
CanvasObject.prototype.draw = function(canvas, matrices) {
    var rctx = canvas.rctx;
    var program = canvas.program;
    var deferred = this.q.defer();
    //Rebind object's buffers
    if(_.isEmpty(this.buffers)) {
        deferred.resolve(this);
    } else {
        this.q.all(_.reduce(this.buffers, function(promises, buffer) {
            return promises.concat(buffer.rebind(canvas, matrices));
        }, [])).then((function(object) {
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
                //Draw either elements or arrays
                if(object.buffers.element) {
                    rctx.drawElements(rctx.TRIANGLES, object.buffers.element.numItems, rctx.UNSIGNED_SHORT, 0);
                } else {
                    rctx.drawArrays(rctx.TRIANGLE_STRIP, 0, object.buffers.position.numItems);
                }
                deferred.resolve(object);
            };
        })(this));
    }
    return deferred.promise;
};
CanvasObject.prototype.setColor = function(color) {
    this.buffers.color = new ColorBuffer(this.buffers.color.createData(color));
    return this; //to allow chaining
};
//Inject $q service in CanvasObject class
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

function Solid(faces, elementArray) {
    CanvasObject.apply(this, arguments);
    this.faces = [];
    _.each(faces, function(face) {
        this.faces.push(new Shape(face));
    }, this);
    this.setElementArray(elementArray);
}
Solid.prototype = Object.create(CanvasObject.prototype);
Solid.prototype.constructor = Solid;
Solid.prototype.bindBuffers = function(rctx) {
    CanvasObject.prototype.bindBuffers.apply(this, arguments);
    _.invoke(this.faces, "bindBuffers", rctx);
};
Solid.prototype.setElementArray = function(elementArray) {
    if(elementArray) {
        //Extract and merge data from face buffers
        _.each(_.reduce(this.faces, function(data, face) {
            var data = _.reduce(face.buffers, function(data, buffer, type) {
                data[type] = (data[type] || []).concat(buffer.data);
                return data;
            }, data);
            face.buffers = null;
            return data;
        }, {}), function(data, type) {
            this.buffers[type] = new Buffer[type](data);
        }, this);
        this.buffers.element = new ElementBuffer(elementArray);
    }
    return this; //to allow chaining
};
Solid.prototype.setColor = function(color) {
    var colorBuffer = this.buffers.color;
    if(colorBuffer) {
        CanvasObject.prototype.setColor.apply(this, arguments);
    } else {
        _.invoke(this.faces, "setColor", color);
    }
    return this; //to allow chaining
};
Solid.prototype.draw = function(canvas, matrices) {
    var deferred = this.q.defer();
    CanvasObject.prototype.draw.apply(this, arguments).then(function(object) {
        async.eachSeries(object.faces, function(face, cb) {
            console.group("Drawing face %O", face);
            face.draw(canvas, matrices).then(function() {
                console.info("Face drawn");
                console.groupEnd();
                cb();
            });
        }, function() {
            return deferred.resolve(object);
        });
    });
    return deferred.promise;
};

function Vertex() {}

function LightSource() {}