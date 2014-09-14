"use strict";

angular.module("AngularGL.Shaders", []);

function Shader(filename, q) {
    this.filename = filename;
    this.q = q;
    this.compiled = q.defer();
}
Shader.prototype.load = function(http) {
    var deferred = this.q.defer();
    console.log(_.sprintf("Loading '%s'...", this.filename));
    http.get(this.filename).success(deferred.resolve).error(deferred.reject);
    return deferred.promise;
};
Shader.prototype.compile = function(rctx) {
    var compiled = rctx.createShader(this instanceof FragmentShader && rctx.FRAGMENT_SHADER || rctx.VERTEX_SHADER);
    rctx.shaderSource(compiled, this.code);
    console.log("Compiling '%s'...", this.filename);
    rctx.compileShader(compiled);
    if (rctx.getShaderParameter(compiled, rctx.COMPILE_STATUS)) {
        this.compiled.resolve(compiled);
    } else {
        var err = rctx.getShaderInfoLog(compiled);
        console.warn(err);
        this.compiled.reject(err);
    }
};

function FragmentShader() {
    Shader.apply(this, arguments);
}
FragmentShader.prototype = Object.create(Shader.prototype);
FragmentShader.prototype.constructor = FragmentShader;

function VertexShader() {
    Shader.apply(this, arguments);
}
VertexShader.prototype = Object.create(Shader.prototype);
VertexShader.prototype.constructor = VertexShader;
