"use strict";

angular.module("AngularGL", [])// ["AngularGL.Canvas", "AngularGL.Objects", "AngularGL.Buffers", "AngularGL.Shaders"])
/*.factory("Canvas", function() {return Canvas;})
.factory("Shape", function() {return Shape;})
.factory("Solid", function() {return Solid;})
.factory("LightSource", function() {return LightSource;})
.factory("Utils", function() {return Utils;})*/
.factory("AngularGL", function() {return AngularGL;});

//Overridden constructors
var AngularGL = {
    WebGLRenderer: function(domElementId) {
        var canvas = document.getElementById(domElementId);
        THREE.WebGLRenderer.call(this, {
            canvas: canvas
        });
        this.setSize(canvas.clientWidth, canvas.clientHeight);
    },
    Scene: function(domElementId) {
        THREE.Scene.call(this);
        this.renderer = new AngularGL.WebGLRenderer(domElementId);
    }
};
//Defaults
_.each(THREE, function(value, key) {
    if(!_.isFunction(value)) {
        return; //skip properties
    }
    if (!AngularGL[key]) {// unless overridden above, create default that only...
        (function(key) {
            AngularGL[key] = function() {
                THREE[key].apply(this, arguments); //...calls super
            };
        }(key));
    }
    AngularGL[key].prototype = Object.create(THREE[key].prototype);
    AngularGL[key].prototype.constructor = AngularGL[key];
});
//Overridden prototypes
AngularGL.Scene.prototype.__addObject = function(obj) {
    if(obj instanceof THREE.Camera) {
        this.camera = obj;
    } else {
        THREE.Scene.prototype.__addObject.call(this, obj);
    }
};
AngularGL.Scene.prototype.animate = function(animateFn) {
    requestAnimationFrame(this.animate.bind(this, animateFn));
    animateFn();
    this.renderer.render(this, this.camera);
};

//--------------------------------------------------------------------

var Utils = {
    LOG_LEVEL: 1,
    LOG_COLLAPSED: false,
    hexchars: "0123456789abcdef",
    requestAnimFrame: function(cb) {
        /*(window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(cb) {
            window.setTimeout(cb, 1000/60);
        })(cb);*/
        Utils.timeout(cb, 1000/60);
    },
    setMatrixUniforms: function(rctx, program, matrices) {
        var pMatrix = matrices[0];
        var mvMatrix = matrices[1];
        var normalMatrix = mat3.create();

        rctx.uniformMatrix4fv(program.pMatrixUniform, false, pMatrix);
        rctx.uniformMatrix4fv(program.mvMatrixUniform, false, mvMatrix);
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        rctx.uniformMatrix3fv(program.nMatrixUniform, false, normalMatrix);
    },
    degToRad: function(degrees) {
        return degrees * Math.PI / 180;
    },
    vecToHex: function(colorVector) {
        return _.reduce(colorVector, function(hex, channel) {
            return hex + _.toHex(channel);
        }, "#");
    },
    hexToVec: function(hexColor) {
        return _.map(hexColor.match(/(\w{2})/g), function(channel) {
            return _.toDec(channel);
        });
    }
};
//Inject $timeout service in Utils object
angular.injector(["ng"]).invoke(["$timeout", function(timeout) {
    Utils.timeout = timeout;
}]);

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
    model: function(array, templateArray) {
        var a = [];
        array = array || [];
        for(var i=0, l=templateArray.length; i < l; i++) {
            a[i] =  _.isUndefined(array[i])? templateArray[i] : array[i];
        }
        return a;
    },
    toHex: function(n) {
        return Utils.hexchars.charAt(Math.floor(n / 16)) + Utils.hexchars.charAt(n % 16);
    },
    toDec: function(str) {
        return _.reduce(_.reverse(str), function(dec, char, i) {
            return dec + (Math.pow(16, i) * Utils.hexchars.indexOf(char.toLowerCase()));
        }, 0);
    },
    reverse: _.str.reverse,
    normalize: function(o, n) {
        if(_.isArray(o)) {
            return _.map(o, function(o) {
                return _.normalize(o, n);
            });
        } else {
            return o/(n || 1);
        }
    },
    numToBitArray: function(o, factor, padding) {
        factor = factor || 1;
        return _.chain(o.toString(2)).pad(padding || 2, "0").chars().map(function(str) {
            return _(str).toNumber() * factor;
        }).value();
    }
});

//Logging
var consoleMethods = ["log", "debug", "info", "warn", "group", "groupEnd"/*, "time", "timeEnd"*/];
_.each(consoleMethods, function(method) {
    //Save reference to original method
    console[_.sprintf("_%s", method)] = console[method];
});
if(!Utils.LOG_LEVEL) {
    _.each(consoleMethods, function(method) {
        console[method] = _.noop;
    });
}
//Override console.group
console.__group__ = console.group;
console.group = function() {
    console[Utils.LOG_COLLAPSED? "groupCollapsed" : "__group__"].apply(console, arguments);
}