"use strict";

angular.module("AngularGL.Canvas", []);

function Canvas(elementId, options) {
    var canvas = this;
    canvas.width = options.width || 300;
    canvas.height = options.height || 150;
    canvas.background = _.template(options.background, [1, 1, 1, 1]);
    canvas.HTMLCanvas = document.getElementById(elementId);
    canvas.HTMLCanvas.width = canvas.width;
    canvas.HTMLCanvas.height = canvas.height;
    canvas.objects = [];
    canvas.shaders = [];
    //Initialize canvas
    canvas.init();
}
Canvas.prototype.init = function() {
    var options;
    try {
        options = {alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: true};
        this.rctx = this.HTMLCanvas.getContext("experimental-webgl", options);
        this.rctx.viewportWidth = this.width;
        this.rctx.viewportHeight = this.height;
        console.log("Canvas initialized");
    } catch (e) {
        console.warn("Could not initialise rendering context:", e);
    }
};
Canvas.prototype.addObjects = function() {
    _.each(_.flatten(arguments), function(object) {
        this.objects.push(object);
    }, this);
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
    var _render = function(canvas) {
        console.time("Rendering");
        //Initialize WebGL program (one time only)
        canvas.initProgram();
        //Clear canvas, then bind buffers for and draw each object
        var matrices = canvas.clear(scope);
        _.invoke(canvas.objects, "bindBuffers", canvas.rctx);
        async.eachSeries(canvas.objects, function(object, cb) {
            console.group("Drawing object %O", object);
            object.draw(canvas, matrices).then(function(object) {
                console.log("Object drawn");
                console.groupEnd();
                cb();
            });
        }, function() {
            console.timeEnd("Rendering");
        });
    };
    var compiledShaders = _.pluck(this.shaders, "compiled");
    if(_.every(compiledShaders, function(compiledShader) {
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
    _.each(["position", "color", "texture"], function(vertexAttributeType) {
        var location = _.sprintf("aVertex%s", _.capitalize(vertexAttributeType));
        if((program.vertexAttributes[vertexAttributeType] = rctx.getAttribLocation(program, location)) != -1) {
            rctx.enableVertexAttribArray(program.vertexAttributes[vertexAttributeType]);
        } else {
            console.warn("Could not enable %s vertex attribute array", vertexAttributeType);
        }
    });
    program.pMatrixUniform = rctx.getUniformLocation(program, "uPMatrix");
    program.mvMatrixUniform = rctx.getUniformLocation(program, "uMVMatrix");
    program.sampleUniform = rctx.getUniformLocation(program, "uSampler");
    this.program = program;
};
Canvas.prototype.clear = function(scope) {
    console.log("Clearing canvas");
    var rctx = this.rctx;
    var program = this.program;
    rctx.clearColor.apply(rctx, this.background);
    rctx.enable(rctx.DEPTH_TEST);
    var mvMatrix = mat4.create();
    var pMatrix = mat4.create();
    rctx.viewport(0, 0, rctx.viewportWidth, rctx.viewportHeight);
    rctx.clear(rctx.COLOR_BUFFER_BIT | rctx.DEPTH_BUFFER_BIT);
    mat4.perspective(45, rctx.viewportWidth / rctx.viewportHeight, 0.1, 100.0, pMatrix);
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [scope.x, scope.y, scope.z]);
    mat4.rotate(mvMatrix, scope.rx/10, [1, 0, 0]);
    mat4.rotate(mvMatrix, scope.ry/10, [0, 1, 0]);
    mat4.rotate(mvMatrix, scope.rz/10, [0, 0, 1]);
    return [pMatrix, mvMatrix];
};
/*Canvas.prototype.draw = function(scope) {
    //Loop objects
    _.invoke(this.objects, "draw", this, this.clear(scope));
};*/
/* Event handling */
Canvas.prototype.on = function() {
    var bind = (function(canvas) {
        return function(e, handleFn) {
            var o = _(e).startsWith("key")? document : canvas.HTMLCanvas;
            o[_.sprintf("on%s", e)] = handleFn;
        };
    })(this);
    if(arguments.length === 1 && _.isObject(arguments[0])) {
        _.each(arguments[0], function(handleFn, e) {
            bind(e, handleFn);
        });
    } else {
        bind.apply(null, arguments);
    }
};
//Inject $http and $q services in Canvas class
angular.injector(["ng"]).invoke(["$http", "$q", function(http, q) {
    Canvas.prototype.http = http;
    Canvas.prototype.q = q;
}]);