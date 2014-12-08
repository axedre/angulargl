"use strict";

angular.module("AngularGL", [])
.factory("AngularGL", ["$http", "$q", function(http, q) {
    AngularGL.http = http;
    AngularGL.q = q;
    return AngularGL;
}]);

//Overridden constructors
var AngularGL = {
    WebGLRenderer: function(scene, params) {
        var canvas = document.getElementById(params.domElementId);
        THREE.WebGLRenderer.call(this, {
            canvas: canvas,
            antialias: true,
            alpha: params.alpha
        });
        //this.scene = scene;
        this.shadowMapEnabled = true;
        this.shadowMapType = AngularGL.PCFSoftShadowMap;
        this.setSize(canvas.width || canvas.clientWith, canvas.height || canvas.clientHeight);
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
        this._render = this.render;
        this.render = function() {
            this._render.apply(this, arguments.length? arguments : [scene, scene.camera]);
        };
    },
    Scene: function(params) {
        THREE.Scene.call(this);
        this.cameras = [];
        this.animations = [];
        this.scope = params.scope;
        this.controls = typeof params.controls !== "undefined"? params.controls : true;
        this.benchmark = params.benchmark;
        this.renderer = new AngularGL.WebGLRenderer(this, params);
        this.stepCounter = -1;
        this.renderLoop = (new function(scene) {
            this.id = null;
            var animate = (function() {
                this.id = requestAnimationFrame(animate.bind(this));
                var tic = new Date();
                this.step();
                if(scene.benchmark) {
                    var time = new Date() - tic;
                    if(!scene.stepCounter) {
                        scene.benchmark_results.startupTime = time;
                    }
                    scene.benchmark_results.renderTimes[scene.stepCounter % 1000] = time;
                }
            }.bind(this));
            this.start = function() {
                if(!this.id) {
                    _.invoke(scene.animations, "prepare");
                    animate();
                }
            };
            this.stop = function() {
                cancelAnimationFrame(this.id);
                this.id = null;
            };
            this.step = function() {
                scene.stepCounter++;
                //Invoke all animation steps
                _.invoke(scene.animations, "step");
                //Render
                scene.renderer.render();
                if(this.id && scene.controls) {
                    scene.controls.update();
                }
                //TODO: consider removing
                if(!scene.scope.$$phase) {
                    scene.scope.$digest();
                }
                if(scene.stepCounter === 1000) {
                    scene.reportBenchmark();
                }
            };
            this.toggle = function(p) {
                this.id && this.stop() || p && this.start();
            };
            this.reset = function() {
                this.prepareFn();
                if(!this.id) {
                    scene.render();
                }
            };
        }(this));
        this.reportBenchmark = function(canvas, div) {
            this.benchmark = false;
            this.benchmark_results.avgRenderTime = _.reduce(this.benchmark_results.renderTimes, function(S, time) {
                return S + time;
            }, 0) / this.benchmark_results.renderTimes.length;
            //delete this.benchmark_results.renderTimes;
            this.benchmark_results.footprint = window.performance && window.performance.memory? window.performance.memory : "unsupported";
            console.info(this.benchmark_results);
            if(canvas && div) {
                canvas.parentNode.removeChild(div);
            }
        };
        window.addEventListener("keydown", function(event) {
            if(event.keyCode === "C".charCodeAt(0)) {
                this.cameras.push(this.camera);
                this.camera = this.cameras.shift();
            }
        }.bind(this));
        //Activate benchmarking if needed
        if(this.benchmark) {
            this.benchmark_results = {
                startupTime: 0,
                avgRenderTime: null,
                renderTimes: [],
                footprint: null
            };
            var canvas = document.getElementById(params.domElementId);
            var div = document.createElement("div");
            div.classList.add("well", "bg-info", "text-right");
            var button = document.createElement("button");
            button.classList.add("btn", "btn-warning");
            button.addEventListener("click", this.reportBenchmark.bind(this, canvas, div));
            button.innerText = "Stop";
            var p = document.createElement("p");
            p.classList.add("pull-left");
            p.innerText = "Benchmarking in progress";
            div.appendChild(p);
            div.appendChild(button);
            canvas.parentNode.insertBefore(div, canvas);
        }
        //Destroy scene on route change
        this.scope.$on("$routeChangeStart", function() {
            angular.element(this.renderer.domElement).remove();
        }.bind(this));
    },
    Animation: function(scene, step, reset) {
        //TODO: is complete even necessary?
        this.complete = true;
        this.running = false;
        this.step = function() {
            if(this.running) {
                this.stepOnce();
            }
        };
        this.stepOnce = function() {
            this.complete = false;
            (step || function() {}).call(this);
        };
        this.prepare = function() {
            if(this.complete) {
                this.reset();
            }
        };
        this.start = function() {
            this.running = true;
        };
        this.stop = function() {
            this.running = false;
        };
        this.toggle = function(p) {
            this.running = p;
        };
        this.reset = reset || function() {};
        scene.animations.push(this);
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
        //TODO: handle scene with multiple mirrors
        (new AngularGL.Animation(scene, function() {
            this.render();
        }.bind(this))).start();
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
        obj.aspect = this.width/this.height;
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
    this.renderLoop.step();
};
AngularGL.Scene.prototype.run = function() {
    if(!(this.camera && this.camera instanceof THREE.Camera)) {
        console.error("At least one Camera object is required to render scene");
        return;
    }
    this.renderLoop.start();
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
            var canvas = this.renderer.getContext().canvas;
            return canvas.width || canvas.clientWidth;
        }
    },
    height: {
        get: function() {
            var canvas = this.renderer.getContext().canvas;
            return canvas.height || canvas.clientHeight;
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
    var thetaSegments, phiSegments;
    var segments = parameters.segments || [8, 8];
    if(_.isArray(segments)) {
        thetaSegments = segments[0];
        phiSegments = segments[1];
    } else {
        thetaSegments = phiSegments = segments;
    }
    var innerRadius = parameters.innerRadius || 1;
    var outerRadius = parameters.outerRadius || 10;
    var start = parameters.start || 0;
    var length = parameters.length || Math.PI * 2;
    var geometry = new AngularGL.RingGeometry(innerRadius, outerRadius, thetaSegments, phiSegments, start, length);
    var material = new AngularGL.MeshPhongMaterial(parameters);
    AngularGL.Mesh.call(this, geometry, material);
};
AngularGL.Ring.prototype = Object.create(AngularGL.Mesh.prototype);
AngularGL.Ring.prototype.constructor = AngularGL.Ring;
AngularGL.Cube = function(parameters) {
    parameters = parameters || {};
    var xyz = parameters.xyz || 10;
    var sides = parameters.sides || [];
    var width = sides[0] || xyz;
    var height = sides[1] || xyz;
    var depth = sides[2] || xyz;
    var segments = parameters.segments || 1;
    var color = parameters.color || 0xffffff;
    var scene = parameters.scene;
    var geometry = new AngularGL.BoxGeometry(width, height, depth, segments, segments, segments);
    var material;
    var mirrors = [];
    if(parameters.reflectivity && _.isArray(parameters.reflectivity)) {
        var materialArray = [];
        _.each(parameters.reflectivity, function(faceReflectivity) {
            if(faceReflectivity) {
                var mirror = new AngularGL.Mirror(scene, {
                    width: width,
                    height: height,
                    color: color
                });
                mirrors.push(mirror);
                materialArray.push(mirror.material);
            } else {
                materialArray.push(new AngularGL.MeshPhongMaterial({color: color, side: AngularGL.FrontSide}));
            }
        });
        material = new AngularGL.MeshFaceMaterial(materialArray);
    } else {
        material = new AngularGL.MeshPhongMaterial(parameters);
    }
    AngularGL.Mesh.call(this, geometry, material);
    if(mirrors.length) {
        _.each(mirrors, function(mirror) {
            this.add(mirror);
        }, this);
    }
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
