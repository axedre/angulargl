"use strict";

angular.module("AngularGL", [])
.factory("AngularGL", ["$http", "$q", function(http, q) {
    AngularGL.http = http;
    AngularGL.q = q;
    return AngularGL;
}]);

//Overridden constructors
var AngularGL = {
    WebGLRenderer: function(params) {
        var canvas = document.getElementById(params.domElementId);
        THREE.WebGLRenderer.call(this, {
            canvas: canvas,
            antialias: true,
            alpha: params.alpha
        });
        this.shadowMapEnabled = true;
        this.shadowMapType = AngularGL.PCFSoftShadowMap;
        this.setSize(canvas.clientWidth, canvas.clientHeight);
        this.gammaInput = true;
        this.gammaOutput = true;
        //Methods
        this._renderBuffer = this.renderBuffer;
        this.renderBuffer = function(camera, lights, fog, material, geometryGroup, object) {
            if(typeof material.vertexShader === "object" || typeof material.fragmentShader === "object") {
                AngularGL.q.all({
                    vertex: material.vertexShader,
                    fragment: material.fragmentShader
                }).then(function(shaders) {
                    material.vertexShader = shaders.vertex.data || shaders.vertex;
                    material.fragmentShader = shaders.fragment.data || shaders.fragment;
                    this._renderBuffer(camera, lights, fog, material, geometryGroup, object);
                }.bind(this));
            } else {
                this._renderBuffer(camera, lights, fog, material, geometryGroup, object);
            }
        }
    },
    Scene: function(params) {
        THREE.Scene.call(this);
        this.cameras = [];
        this.animations = [];
        this.scope = params.scope;
        this.controls = typeof params.controls !== "undefined"? params.controls : true;
        this.renderer = new AngularGL.WebGLRenderer(params);
        this.loop = new AngularGL.Animation(this, function() {});
        window.addEventListener("keydown", function(event) {
            if(event.keyCode === "C".charCodeAt(0)) {
                this.cameras.push(this.camera);
                this.camera = this.cameras.shift();
            }
        }.bind(this));
        //Destroy scene on route change
        this.scope.$on("$routeChangeStart", function(e, routeTo, routeFrom) {
            /*console.log(this.renderer.info.memory);
            //Cancel render loop and animations
            while(this.animations.length) {
                var animation = this.animations.pop();
                animation.stop();
                animation = null;
            }
            //Remove objects from the scene
            AngularGL.removeChildren(this);
            //Remove cameras
            while(this.cameras.length) {
                var camera = this.cameras.pop();
                camera = null;
            }
            //Remove scope
            delete this.scope;
            console.log(this.renderer.info.memory);
            e.preventDefault();*/
            /*e.preventDefault();
            console.log(routeTo);
            AngularGL.location.path(routeTo.$$route.originalPath, true);*/
            //routeTo.reload();
        }.bind(this));
    },
    Animation: function(scene, animateFn, prepareFn) {
        this.id;
        this.animateFn = animateFn || function() {};
        this.prepareFn = prepareFn || function() {};
        this.complete;
        this.scene = scene;
        this.scene.animations.push(this);
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
    MeshBasicMaterial: function(parameters) {
        THREE.MeshBasicMaterial.call(this, _.extend({}, AngularGL.DEFAULT_MATERIAL_PARAMETERS, parameters));
    },
    MeshPhongMaterial: function(parameters) {
        THREE.MeshPhongMaterial.call(this, _.extend({}, AngularGL.DEFAULT_MATERIAL_PARAMETERS, parameters));
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
    },
    Mirror: function(scene, params) {
        THREE.Mirror.call(this, scene.renderer, scene.camera, _.extend({
            textureWidth: scene.width,
            textureHeight: scene.height
        }, params));
        this.film = new AngularGL.Film(params);
        this.film.castShadow = false;
        this.film.position.z += 5;
        this.add(this.film);
    },
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
AngularGL.MeshFaceMaterial.prototype.dispose = function() {
    while(this.materials.length) {
        var material = this.materials.pop();
        //if(material instanceof THREE.MirrorMaterial)
        //console.log(material);
        material.dispose();
    }
};
AngularGL.PerspectiveCamera.prototype.lookAtOrigin = function() {
    this.lookAt(new AngularGL.Vector3());
};
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
    THREE.Scene.prototype.add.call(this, obj);
};
AngularGL.Scene.prototype.render = function() {
    (this.renders || function() {})();
    this.renderer.render(this, this.camera);
    if(this.loop.running && this.controls) {
        this.controls.update();
    }
    if(this.scope && !this.scope.$$phase) {
        this.scope.$digest();
    }
};
AngularGL.Scene.prototype.run = function(renders) {
    if(!(this.camera && this.camera instanceof THREE.Camera)) {
        console.error("At least one Camera object is required to render scene");
        return;
    }
    this.renders = renders;
    this.loop.start();
};
Object.defineProperties(AngularGL.Scene.prototype, {
    camera: {
        set: function(camera) {
            this.scope.camera = camera;
            if(this.controls) {
                this.controls = new AngularGL.OrbitControls(camera, this.renderer.domElement);
            }
        },
        get: function() {
            return this.scope.camera;
        }
    },
    gui: {
        set: function(partial) {
            this.scope.gui = partial;
        }
    },
    width: {
        get: function() {
            var ctx = this.renderer.getContext();
            return ctx.canvas.clientWidth;
        }
    },
    height: {
        get: function() {
            var ctx = this.renderer.getContext();
            return ctx.canvas.clientHeight;
        }
    }
});
Object.defineProperties(AngularGL.Animation.prototype, {
    running: {
        get: function() {
            return !!this.id;
        }
    }
});
Object.defineProperties(AngularGL.Mirror.prototype, {
    reflectivity: {
        set: function(r) {
            this.film.reflectivity = r;
        }
    }
});
//New classes or subclasses
AngularGL.Plane = function(parameters) {
    var xyz = parameters.xyz || 100;
    var geometry = new AngularGL.PlaneBufferGeometry(xyz, xyz);
    var material = new AngularGL.MeshPhongMaterial(parameters);
    AngularGL.Mesh.call(this, geometry, material);
    this.rotation.x = -Math.PI / 2;
    this.castShadow = false;
};
AngularGL.Plane.prototype = Object.create(AngularGL.Mesh.prototype);
AngularGL.Plane.prototype.constructor = AngularGL.Plane;
AngularGL.Film = function(parameters) {
    var geometry = new AngularGL.BoxGeometry(parameters.width || 10, parameters.height || 10, AngularGL.EPSILON);
    var material = new AngularGL.MeshPhongMaterial({
        color: parameters.color || 0xffffff,
        transparent: true
    });
    AngularGL.Mesh.call(this, geometry, material);
};
AngularGL.Film.prototype = Object.create(AngularGL.Mesh.prototype);
AngularGL.Film.prototype.constructor = AngularGL.Film;
Object.defineProperties(AngularGL.Film.prototype, {
    reflectivity: {
        set: function(r) {
            this.material.opacity = 1 - r;
        }
    }
});
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
    var xyz = parameters.xyz || 10;
    var sides = parameters.sides || [];
    var segments = parameters.segments || 1;
    var geometry = new AngularGL.BoxGeometry(sides[0] || xyz, sides[1] || xyz, sides[2] || xyz, segments, segments, segments);
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
AngularGL.Sun = function(sunIntensity, shadowCameraVisible) {
    var sunIntensity = (typeof sunIntensity === "undefined" || sunIntensity === "auto")? 0.3 : sunIntensity;
    AngularGL.SpotLight.call(this, "#d6fc6f"/* color */, sunIntensity, 0/* distance */, Math.PI/2 /* angle */, 1/* exponent */);
    this.position.set(1000, 2000, 1000);
    this.shadowDarkness = 0.3 * sunIntensity;
    this.shadowBias = -0.0002;
    this.shadowCameraNear = 750;
    this.shadowCameraFar = 4000;
    this.shadowCameraFov = 30;
    this.shadowCameraVisible = shadowCameraVisible;
};
AngularGL.Sun.prototype = Object.create(AngularGL.SpotLight.prototype);
AngularGL.Sun.prototype.constructor = AngularGL.Sun;
AngularGL.SkyBox = function(color) {
    AngularGL.Cube.call(this, {xyz: 5000});
    this.material = new AngularGL.MeshBasicMaterial({color: color || "#a7dcf8"});
    this.material.side = AngularGL.BackSide;
};
AngularGL.SkyBox.prototype = Object.create(AngularGL.Cube.prototype);
AngularGL.SkyBox.prototype.constructor = AngularGL.SkyBox;
//Constants
AngularGL.DEFAULT_MATERIAL_PARAMETERS = {
    specular: 0xffffff,
    shininess: 30,
    combine: AngularGL.MixOperation,
    side: AngularGL.DoubleSide
};
AngularGL.EPSILON = 1e-1;
//New static methods
AngularGL.removeChildren = function(parent) {
    while(parent.children.length) {
        var object = parent.children[0];
        AngularGL.removeChildren(object);
        parent.remove(object);
        if(object instanceof THREE.Mesh) {
            object.geometry.dispose();
            object.material.dispose();
        }
    }
};
AngularGL.load = function(resource) {
    return this.http.get("js/libs/angulargl/" + resource);
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
