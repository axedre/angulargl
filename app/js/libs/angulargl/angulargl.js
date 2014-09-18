"use strict";

angular.module("AngularGL", ["AngularGL.Canvas", "AngularGL.Objects", "AngularGL.Buffers", "AngularGL.Shaders"])
.factory("Canvas", function() {return Canvas;})
.factory("Shape", function() {return Shape;})
.factory("Solid", function() {return Solid;})
.factory("LightSource", function() {return LightSource;})
.factory("Utils", function() {return Utils;})
.factory("AngularGL", ["$injector", AngularGL]);

function AngularGL(injector) {
    var out = {};
    _.each(angular.module("AngularGL")._invokeQueue, function(item) {
        var name = item[2][0];
        if(name === "AngularGL") return;
        out[name] = injector.get(name);
    });
    return out;
}

var Utils = {
    LOG_COLLAPSED: true,
    requestAnimFrame: function(cb) {
        (window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(callback) {
            window.setTimeout(callback, 1000/60);
        })(cb);
    },
    initObjectBuffers: function(object, rctx) {
        var buffers = [];
        if(object.type === "shape") {
            buffers.push(this.bufferPair(object.vertices, rctx));
        } else {
            //TODO: distinguish between "solid" and "objectCollection" object types
            _.each(object.faces, function(face) {
                buffers = buffers.concat(this.initObjectBuffers(face, rctx));
            }, this);
            object.elemArrayBuffer = rctx.createBuffer();
            rctx.bindBuffer(rctx.ELEMENT_ARRAY_BUFFER, object.elemArrayBuffer);
            rctx.bufferData(rctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(object.elemArray), rctx.STATIC_DRAW);
        }
        return buffers;
    }
};

//Set Matrix Uniforms
mat4.setMatrixUniforms = function(rctx, program, matrices) {
    rctx.uniformMatrix4fv(program.pMatrixUniform, false, matrices[0]/*pMatrix*/);
    rctx.uniformMatrix4fv(program.mvMatrixUniform, false, matrices[1]/*mvMatrix*/);
};

_.mixin(_.string.exports());
_.mixin({
    grow: function(array, size, fill) {
        var a = [];
        for(var i=0; i < size; i++) {
            a[i] = _.isUndefined(array[i])? fill : array[i];
        }
        return a;
    },
    stem: function(filename) {
        return filename.replace(/^(.*)(\..*)$/, "$1");
    },
    eaches: function() {
        var args = _.toArray(arguments);
        var iteratee, ctx = args.pop();
        if(_.isFunction(ctx)) {
            iteratee = ctx;
            ctx = this;
        } else {
            iteratee = args.pop();
        }
        _.each(args.shift(), function(first, i) {
            iteratee.apply(this, [first].concat(_.zip.apply(this, args)[i]));
        }, ctx);
    },
    template: function(array, templateArray) {
        var a = [];
        array = array || [];
        for(var i=0, l=templateArray.length; i < l; i++) {
            a[i] =  _.isUndefined(array[i])? templateArray[i] : array[i];
        }
        return a;
    }
});

//Override console.group
console.group = function() {
    console[Utils.LOG_COLLAPSED? "groupCollapsed" : "group"].apply(console, arguments);
}
