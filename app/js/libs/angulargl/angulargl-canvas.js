"use strict";

angular.module("AngularGL.Canvas", []);

function Canvas(elementId, options) {
    var canvas = this;
    canvas.width = options.width || 300;
    canvas.height = options.height || 150;
    canvas.background = _.model(options.background, [0, 0, 0, 1]);
    canvas.objects = [];
    canvas.shaders = [];
    //Initialize canvas
    canvas.init(elementId);
}
Canvas.prototype.init = function(elementId) {
    var options = {alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: true};
    try {
        var rctx = document.getElementById(elementId).getContext("webgl", options);
        var width = rctx.canvas.clientWidth;
        var height = rctx.canvas.clientHeight;
        _.extend(rctx.canvas, {
            width: width,
            height: height
        });
        rctx.clearColor.apply(rctx, this.background);
        rctx.viewport(0, 0, rctx.canvas.width, rctx.canvas.height);
        this.rctx = rctx;
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
    var deferred = this.q.defer();
    var _render = function(canvas) {
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
    rctx.clear(rctx.COLOR_BUFFER_BIT | rctx.DEPTH_BUFFER_BIT);
    var aspect = rctx.canvas.clientWidth / rctx.canvas.clientHeight;
    mat4.perspective(45, aspect, 0.1, 100.0, pMatrix);
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [scope.x, scope.y, scope.z]);
    mat4.rotate(mvMatrix, scope.rx/10, [1, 0, 0]);
    mat4.rotate(mvMatrix, scope.ry/10, [0, 1, 0]);
    mat4.rotate(mvMatrix, scope.rz/10, [0, 0, 1]);
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