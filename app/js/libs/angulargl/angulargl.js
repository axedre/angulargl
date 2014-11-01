"use strict";

angular.module("AngularGL", [])
.factory("AngularGL", function() {return AngularGL;});

//Overridden constructors
var AngularGL = {
    WebGLRenderer: function(domElementId, alpha) {
        var canvas = document.getElementById(domElementId);
        THREE.WebGLRenderer.call(this, {
            canvas: canvas,
            antialias: true,
            alpha: alpha
        });
        this.shadowMapEnabled = true;
        this.shadowMapType = AngularGL.PCFSoftShadowMap;
        this.setSize(canvas.clientWidth, canvas.clientHeight);
    },
    Scene: function(domElementId, scope, alpha) {
        THREE.Scene.call(this);
        this.cameras = [];
        this.cubeCameras = [];
        this.scope = scope;
        this.renderer = new AngularGL.WebGLRenderer(domElementId, alpha);
        this.loop = new AngularGL.Animation(this, function() {
            //window.setTimeout(function() {this.stop();}.bind(this), 100); //TODO: remove once fully debugged
        });
        window.addEventListener("keydown", function(event) {
            if(event.keyCode === 'C'.charCodeAt(0)) {
                this.cameras.push(this.camera);
                this.camera = this.cameras.shift();
                //this.createControls();
                //this.scope.camera = this.camera;
            }
        }.bind(this));
    },
    Animation: function(scene, animateFn, prepareFn) {
        this.id;
        this.animateFn = animateFn || function() {};
        this.prepareFn = prepareFn || function() {};
        this.complete;
        this.scene = scene;
        this.animate = function() {
            this.id = requestAnimationFrame(this.animate.bind(this));
            this.step();
        };
        this.start = function() {
            if(!this.id) {
                if(this.complete) {
                    this.prepareFn();
                    this.complete = false;
                }
                this.animate();
            }
        };
        this.step = function() {
            this.animateFn();
            this.scene.render();
        };
        this.stop = function() {
            cancelAnimationFrame(this.id);
            this.id = null;
        };
        this.toggle = function(p) {
            this.id && this.stop() || p && this.start();
        };
        this.reset = this.prepareFn;
    },
    Mesh: function() {
        THREE.Mesh.apply(this, arguments);
        this.castShadow = true;
        this.receiveShadow = true;
    },
    SpotLight: function() {
        THREE.SpotLight.apply(this, arguments);
        this.castShadow = true;
    }/*,
    PerspectiveCamera: function() {
        //TODO: attach controls to camera using deferred object to sense scene
        //this.
    }*/
};
//Defaults
for(var prop in THREE) {
    if(_.isFunction(THREE[prop])) {
        if (!AngularGL[prop]) {//Unless overridden above, create default that only...
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
//Overridden or new prototypes
AngularGL.Scene.prototype.add = function(obj) {
    var args = _.flatten(arguments);
    for(var i=0; i<args.length; i++) {
        this.addObject(args[i]);
    }
};
AngularGL.Scene.prototype.addObject = function(obj) {
    if(obj instanceof THREE.Camera) {
        var canvas = this.renderer.domElement;
        obj.aspect = canvas.clientWidth/canvas.clientHeight;
        obj.updateProjectionMatrix();
        if(!this.camera) { //Don't allow overriding camera
            this.camera = obj;
        } else {
            this.cameras.push(obj);
        }
    }
    if(obj instanceof THREE.CubeCamera) {
        this.cubeCameras.push(obj);
    }
    THREE.Scene.prototype.add.call(this, obj);
};
AngularGL.Scene.prototype.render = function() {
    for(var i=0, cc=this.cubeCameras; i < cc.length; i++) {
        var cubeCamera = cc[i];
        cubeCamera.visible = false;
        cubeCamera.updateCubeMap(this.renderer, this);
        cubeCamera.visible = true;
    }
    this.renderer.render(this, this.camera);
    if(this.loop.running && this.controls) {
        this.controls.update();
    }
    if(this.scope && !this.scope.$$phase) {
        this.scope.$digest();
    }
};
AngularGL.Scene.prototype.run = function() {
    if(!(this.camera && this.camera instanceof THREE.Camera)) {
        console.error("At least one Camera object is required to render scene");
        return;
    }
    this.loop.start();
};
Object.defineProperty(AngularGL.Scene.prototype, "camera", {
    set: function(camera) {
        this.scope.camera = camera;
        this.controls = new AngularGL.OrbitControls(camera, this.renderer.domElement);
    },
    get: function() {
        return this.scope.camera;
    }
});
Object.defineProperty(AngularGL.Animation.prototype, "running", {
    get: function() {
        return !!this.id;
    }
});
//New classes or subclasses
AngularGL.Plane = function(side, color) {
    AngularGL.Mesh.apply(this, [
        new AngularGL.PlaneBufferGeometry(side, side),
        new AngularGL.MeshPhongMaterial({
            color: color || 0xffffff,
            side: AngularGL.DoubleSide,
        })
    ]);
    this.rotation.x = -Math.PI / 2;
    this.castShadow = false;
};
AngularGL.Plane.prototype = Object.create(AngularGL.Mesh.prototype);
AngularGL.Plane.prototype.constructor = AngularGL.Plane;
AngularGL.Cube = function(side, color, wireframe) {
    AngularGL.Mesh.apply(this, [
        new AngularGL.BoxGeometry(side, side, side, 32, 32, 32),
        new AngularGL.MeshPhongMaterial({
            color: color || 0xffffff,
            wireframe: !!wireframe
        })
    ]);
};
AngularGL.Cube.prototype = Object.create(AngularGL.Mesh.prototype);
AngularGL.Cube.prototype.constructor = AngularGL.Cube;
AngularGL.Sphere = function(radius, color) {
    AngularGL.Mesh.apply(this, [
        new AngularGL.SphereGeometry(radius, 32, 32),
        new AngularGL.MeshPhongMaterial({
            color: color || 0xffffff
        })
    ]);
};
AngularGL.Sphere.prototype = Object.create(AngularGL.Mesh.prototype);
AngularGL.Sphere.prototype.constructor = AngularGL.Sphere;

//--------------------------------------------------------------------

AngularGL.isArray = Array.isArray || function(obj) {
    return toString.call(obj) === "[object Array]";
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
