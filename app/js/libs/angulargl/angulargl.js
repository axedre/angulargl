"use strict";

angular.module("AngularGL", [])
.factory("AngularGL", function() {return AngularGL;});

//Overridden constructors
var AngularGL = {
    WebGLRenderer: function(domElementId) {
        var canvas = document.getElementById(domElementId);
        THREE.WebGLRenderer.call(this, {
            canvas: canvas,
            antialias: true
        });
        this.setSize(canvas.clientWidth, canvas.clientHeight);
    },
    Scene: function(domElementId) {
        THREE.Scene.call(this);
        this.renderer = new AngularGL.WebGLRenderer(domElementId);
        this.loop = new AngularGL.Animation(this, function() {});
    },
    Animation: function(scene, animateFn) {
        this.id;
        this.animateFn = animateFn || function() {};
        this.scene = scene;
        this.animate = function() {
            this.id = requestAnimationFrame(this.animate.bind(this));
            this.animateFn();
            this.scene.render();
        };
        this.start = this.animate;
        this.stop = function() {
            cancelAnimationFrame(this.id);
            this.id = null;
        };
        this.toggle = function(p) {
            this.id && this.stop() || p && this.start();
        }
    }
};
//Defaults
for(var prop in THREE) {
    if(_.isFunction(THREE[prop])) {
        if (!AngularGL[prop]) {// unless overridden above, create default that only...
            (function(prop) {
                AngularGL[prop] = function() {
                    THREE[prop].apply(this, arguments); //...calls super
                };
            }(prop));
        }
        AngularGL[prop].prototype = Object.create(THREE[prop].prototype);
        AngularGL[prop].prototype.constructor = AngularGL[prop];
    } else {
        AngularGL[prop] = THREE[prop];
    }
}
//Overridden prototypes
AngularGL.Scene.prototype.__addObject = function(obj) {
    if(obj instanceof THREE.Camera) {
        this.camera = obj;
        var canvas = this.renderer.domElement;
        this.camera.aspect = canvas.clientWidth/canvas.clientHeight;
        this.camera.updateProjectionMatrix();
        //Once camera is added, orbit controls can be bound to it
        this.controls = new THREE.OrbitControls(obj, canvas);
    } else {
        THREE.Scene.prototype.__addObject.call(this, obj);
    }
};
AngularGL.Scene.prototype.render = function() {
    this.renderer.render(this, this.camera);
    this.controls.update();
};
AngularGL.Scene.prototype.run = function() {
    if(!(this.camera && this.camera instanceof THREE.Camera)) {
        console.error("At least one Camera object is required to render scene");
        return;
    }
    this.loop.start();
};

//--------------------------------------------------------------------

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
