"use strict";

angular.module("AngularGL", [])
.factory("AngularGL", ["$http", "$q", function(http, q) {
    AngularGL.http = http;
    AngularGL.q = q;
    return AngularGL;
}]);

//Overridden constructors
var AngularGL = {
    WebGLRenderer: function(domElementId, alpha) {
        var canvas = document.getElementById(domElementId);
        var renderer =
            //"RaytracingRenderer";
            "WebGLRenderer";
        THREE[renderer].call(this, {
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
        this.reset = function() {
            this.prepareFn();
            if(!this.id) {
                this.scene.render();
            }
        }
    },
    Mesh: function() {
        THREE.Mesh.apply(this, arguments);
        this.material.specular = this.material.color;
        this.castShadow = true;
        this.receiveShadow = true;
    },
    MeshPhongMaterial: function(parameters) {
        THREE.MeshPhongMaterial.call(this, _.extend(AngularGL.DEFAULT_MATERIAL_PARAMETERS, parameters));
    },
    AmbientLight: function(hex) {
        hex = hex || 0xffffff;
        THREE.AmbientLight.call(this, hex);
    },
    PointLight: function(hex, intensity, distance) {
        hex = hex || 0xffffff;
        THREE.PointLight.call(this, hex, intensity, distance);
    },
    SpotLight: function() {
        THREE.SpotLight.apply(this, arguments);
        this.castShadow = true;
    }
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
AngularGL.Scene.prototype.add = function() {
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
AngularGL.Plane = function(parameters) {
    var side = parameters.side || 100;
    var geometry = new AngularGL.PlaneBufferGeometry(side, side);
    var material = new AngularGL.MeshPhongMaterial(parameters);
    AngularGL.Mesh.call(this, geometry, material);
    this.rotation.x = -Math.PI / 2;
    this.castShadow = false;
};
AngularGL.Plane.prototype = Object.create(AngularGL.Mesh.prototype);
AngularGL.Plane.prototype.constructor = AngularGL.Plane;
AngularGL.Circle = function(parameters) {
    var radius = parameters.radius || 10;
    var segments = parameters.segments || 1;
    var start = parameters.start || 0;
    var length = parameters.length || Math.PI * 2;
    var geometry = new AngularGL.CircleGeometry(radius, segments, start, length);
    var material = new AngularGL.MeshPhongMaterial(parameters);
    AngularGL.Mesh.call(this, geometry, material);
};
AngularGL.Circle.prototype = Object.create(AngularGL.Mesh.prototype);
AngularGL.Circle.prototype.constructor = AngularGL.Circle;
AngularGL.Ring = function(parameters) {
    var innerRadius = parameters.innerRadius || 1;
    var outerRadius = parameters.outerRadius || 10;
    var segments = parameters.segments || 1;
    var start = parameters.start || 0;
    var length = parameters.length || Math.PI * 2;
    var geometry = new AngularGL.RingGeometry(innerRadius, outerRadius, segments, segments, start, length);
    var material = new AngularGL.MeshPhongMaterial(parameters);
    AngularGL.Mesh.call(this, geometry, material);
};
AngularGL.Ring.prototype = Object.create(AngularGL.Mesh.prototype);
AngularGL.Ring.prototype.constructor = AngularGL.Ring;
AngularGL.Cube = function(parameters) {
    parameters = parameters || {};
    var side = parameters.side || 10;
    var segments = parameters.segments || 1;
    var geometry = new AngularGL.BoxGeometry(side, side, side, segments, segments, segments);
    var material = new AngularGL.MeshPhongMaterial(parameters);
    AngularGL.Mesh.call(this, geometry, material);
};
AngularGL.Cube.prototype = Object.create(AngularGL.Mesh.prototype);
AngularGL.Cube.prototype.constructor = AngularGL.Cube;
AngularGL.Sphere = function(parameters) {
    var radius = parameters.radius || 10;
    var segments = parameters.segments || 1;
    var geometry = new AngularGL.SphereGeometry(radius, segments, segments);
    var material = new AngularGL.MeshPhongMaterial(parameters);
    AngularGL.Mesh.call(this, geometry, material);
};
AngularGL.Sphere.prototype = Object.create(AngularGL.Mesh.prototype);
AngularGL.Sphere.prototype.constructor = AngularGL.Sphere;
//Constants
AngularGL.DEFAULT_MATERIAL_PARAMETERS = {
    specular: 0xffffff,
    shininess: 30,
    combine: THREE.MixOperation,
    side: AngularGL.DoubleSide
};
AngularGL.EPSILON = 1e-1;
//New static methods
/*AngularGL.Object3D.load = function(src, cb) {
    AngularGL.http.get(src).success(function(data) {
        //var O = eval(data);
        cb(new (eval(data))());
        //console.log(obj);
    }).error(function(err) {
        console.warn(err);
    });
};*/

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
