"use strict";

angular.module("AngularGL.Canvas", []);

function Canvas(elementId, scope, options) {
    var canvas = this;
    options = options || {};
    canvas.width = options.width || 300;
    canvas.height = options.height || 150;
    canvas.objects = [];
    canvas.shaders = [];
    canvas.ambientColor = options.ambientColor || "#000000";
    canvas.lightColor = options.lightColor || "#ffffff";
    canvas.lightDirection = options.lightDirection || [0, -1, 0];
    //Initialize scope
    canvas.initScope(scope);
    //Initialize canvas
    canvas.init(elementId);
}
Canvas.prototype.initScope = function(scope, lighting) {
    scope.canvas = this;
    scope.x = 0;
    scope.y = 0;
    scope.z = -3;
    scope.rx = 0;
    scope.ry = 0;
    scope.rz = 0;
    var unwatchCanvas = scope.$watch("canvas", function(canvas) {
        if(canvas) {
            scope.$watch("canvas.ambientColor", function(ambientColor) {
                ambientColor && canvas.applyAmbientColor(ambientColor, scope);
            });
            scope.$watch("canvas.lightColor", function(lightColor) {
                lightColor && canvas.applyLightColor(lightColor, scope);
            });
            scope.$watch("canvas.lightDirection", function(lightDirection) {
                lightDirection && canvas.applyLightDirection(lightDirection, scope);
            }, true);
            unwatchCanvas();
        }
    });
};
Canvas.prototype.init = function(elementId) {
    var options = {alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: true};
    try {
        var rctx = document.getElementById(elementId).getContext("webgl", options);
        _.extend(rctx.canvas, {
            width: rctx.canvas.clientWidth,
            height: rctx.canvas.clientHeight
        });
        rctx.viewport(0, 0, rctx.canvas.width, rctx.canvas.height);
        this.rctx = rctx;
        console.log("Canvas initialized");
    } catch (e) {
        console.warn("Could not initialise rendering context:", e);
    }
};
Canvas.prototype.applyAmbientColor = function(color, scope) {
    this._ambientColor = _.model(_.normalize(Utils.hexToVec(color), 255), [0, 0, 0, 1]);
    return; //TODO ↓
    if(this.isAnimating || this.isRendering) return;
    this.render(scope);
};
Canvas.prototype.applyLightColor = function(color, scope) {
    this._lightColor = _.model(_.normalize(Utils.hexToVec(color), 255), [0, 0, 0, 1]);
    return; //TODO ↓
    if(this.isAnimating || this.isRendering) return;
    this.render(scope);
};
Canvas.prototype.applyLightDirection = function(lightDirection, scope) {
    this._lightDirection = lightDirection;
    return; //TODO ↓
    if(this.isAnimating || this.isRendering) return;
    this.render(scope);
};
Canvas.prototype.add = function(collection, data) {
    _.each(_.flatten(data), function(object) {
        this[collection].push(object);
    }, this);
};
Canvas.prototype.addObjects = function() {
    this.add("objects", arguments);
};
Canvas.prototype.addShaders = function(shaderOptions) {
    var q = this.q;
    var path = shaderOptions.path;
    this.shaders = [];
    _.each(_.flatten([shaderOptions.fragmentShader]), function(fs) {
        this.shaders.push(new FragmentShader(path + fs, q));
    }, this);
    _.each(_.flatten([shaderOptions.vertexShader]), function(vs) {
        this.shaders.push(new VertexShader(path + vs, q));
    }, this);
    q.all(_.invoke(this.shaders, "load", this.http)).then((function(canvas) {
        return function(codes) {
            _.eaches(canvas.shaders, codes, function(shader, code) {
                shader.code = code;
                shader.compile(canvas.rctx);
            }, canvas);
        };
    })(this));
};
Canvas.prototype.render = function(scope) {
    var deferred = this.q.defer();
    var _render = function(canvas) {
        canvas.isRendering = true;
        console.time("Rendering");
        //Initialize WebGL program (one time only)
        canvas.initProgram();
        //Clear canvas, then bind buffers for and draw each object (2 separate loops)
        var matrices = canvas.clear(scope);
        console.group("bindBuffers");
        _.invoke(canvas.objects, "bindBuffers", canvas.rctx);
        console.groupEnd();
        async.eachSeries(canvas.objects, function(object, cb) {
            console.group("Drawing object %O", object);
            object.draw(canvas, matrices).then(function(object) {
                console.info("Object drawn");
                console.groupEnd();
                cb();
            });
        }, function() {
            canvas.isRendering = false;
            console.timeEnd("Rendering");
            deferred.resolve();
        });
    };
    if(_.every(_.pluck(this.shaders, "compiled"), function(compiledShader) {
        return compiledShader instanceof WebGLShader;
    })) {
        _render(this);
    } else {
        this.q.all(_.pluck(_.pluck(this.shaders, "compiled"), "promise")).then((function(canvas) {
            return function(compiledShaders) {
                //Attach compiled shaders
                console.log("Attaching compiled shaders");
                _.eaches(canvas.shaders, compiledShaders, function(shader, compiledShader) {
                    shader.compiled = compiledShader;
                });
                _render(canvas);
            };
        })(this));
    }
    return deferred.promise;
};
Canvas.prototype.initProgram = function() {
    if(this.program) return; //Early exit
    console.log("Initializing WebGL program");
    var rctx = this.rctx;
    var program = rctx.createProgram();
    _.each(this.shaders, function(shader) {
        rctx.attachShader(program, shader.compiled);
    });
    rctx.linkProgram(program);
    if (!rctx.getProgramParameter(program, rctx.LINK_STATUS)) {
        console.warn("Could not initialise shaders");
    }
    rctx.useProgram(program);
    program.vertexAttributes = {};
    _.each(Buffer.types, function(vertexAttributeType) {
        if(vertexAttributeType === "element") return;
        var location = _.sprintf("aVertex%s", _.capitalize(vertexAttributeType));
        if((program.vertexAttributes[vertexAttributeType] = rctx.getAttribLocation(program, location)) !== -1) {
            rctx.enableVertexAttribArray(program.vertexAttributes[vertexAttributeType]);
            console.log("%s buffer enabled", _.capitalize(vertexAttributeType));
        } else {
            console.warn("Could not enable %s vertex attribute array", vertexAttributeType);
        }
    });
    program.pMatrixUniform = rctx.getUniformLocation(program, "uPMatrix");
    program.mvMatrixUniform = rctx.getUniformLocation(program, "uMVMatrix");
    program.nMatrixUniform = rctx.getUniformLocation(program, "uNMatrix");
    program.samplerUniform = rctx.getUniformLocation(program, "uSampler");
    program.ambientColorUniform = rctx.getUniformLocation(program, "uAmbientColor");
    program.lightingDirectionUniform = rctx.getUniformLocation(program, "uLightingDirection");
    program.directionalColorUniform = rctx.getUniformLocation(program, "uDirectionalColor");
    this.program = program;
};
Canvas.prototype.clear = function(scope) {
    console.log("Clearing canvas");
    scope = scope || { //Default x, y, z, rx, ry, rz if no scope is passed
        x: 0,
        y: 0,
        z: -3,
        rx: 0,
        ry: 0,
        rz: 0
    }
    var rctx = this.rctx;
    var program = this.program;
    rctx.enable(rctx.DEPTH_TEST);
    var mvMatrix = mat4.create();
    var pMatrix = mat4.create();
    rctx.clearColor.apply(rctx, this._ambientColor);
    rctx.clear(rctx.COLOR_BUFFER_BIT | rctx.DEPTH_BUFFER_BIT);
    var aspect = rctx.canvas.clientWidth / rctx.canvas.clientHeight;
    mat4.perspective(45, aspect, 0.1, 100.0, pMatrix);
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [scope.x, scope.y, scope.z]);
    mat4.rotate(mvMatrix, Utils.degToRad(scope.rx), [1, 0, 0]);
    mat4.rotate(mvMatrix, Utils.degToRad(scope.ry), [0, 1, 0]);
    mat4.rotate(mvMatrix, Utils.degToRad(scope.rz), [0, 0, 1]);
    return [pMatrix, mvMatrix];
};
Canvas.prototype.resize = function() {
    var canvas = this.rctx.canvas;
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;
    if (canvas.width != width || canvas.height != height) {
        canvas.width = width;
        canvas.height = height;
    }
    return this; //to allow chaining
};
Canvas.prototype.animate = function(animateFn, cb) {
    //Render
    this.resize().render(animateFn()).then(function() {
        //Request animation frame to call cb function
        Utils.requestAnimFrame(cb);
    });
};
/* Event handling */
Canvas.prototype.on = function() {
    var scope = angular.element(this.rctx.canvas).scope();
    var bind = (function(canvas) {
        return function(e, handleFn) {
            (_.startsWith(e, "key")? document : canvas)[_.sprintf("on%s", e)] = function(e) {
                scope.$apply(function() {
                    handleFn(e);
                    !_.startsWith(e.type, "key") && e.preventDefault();
                });
            };
        };
    })(this.rctx.canvas);
    if(_.isObject(arguments[0])) {
        //Event map
        _.each(arguments[0], function(handleFn, e) {
            bind(e, handleFn);
        });
    } else {
        //Event name, event handler
        bind.apply(null, arguments);
    }
};
//Inject $http and $q services in Canvas class
angular.injector(["ng"]).invoke(["$http", "$q", function(http, q) {
    Canvas.prototype.http = http;
    Canvas.prototype.q = q;
}]);