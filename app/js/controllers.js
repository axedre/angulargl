"use strict";

angular.module("AngularGLApp.controllers", ["AngularGL"])
.controller("RootCtrl", ["$scope", "$location", function($scope, $location) {
    $scope.activePath = null;
    $scope.$on("$routeChangeSuccess", function(){
        $scope.activePath = $location.path().substr(1);
    });
}])
.controller("Prototype01Ctrl", ["$scope", "AngularGL", function($scope, AngularGL) {
    //Scene
    var scene = new AngularGL.Scene("canvas", $scope);

    //Primary Camera
    var camera01 = new AngularGL.PerspectiveCamera(75, 1, 0.1, 1000);
    camera01.position.set(0, 9, 0);
    camera01.rotation.y = Math.PI / 2;
    //$scope.camera = camera01; //To keep track of camera position changes
    scene.add(camera01);

    //Secondary camera
    var camera02 = new AngularGL.PerspectiveCamera(75, 1, 0.1, 1000);
    camera02.position.set(1, 1, -1);
    //camera.rotation.y = Math.PI / 2;
    scene.add(camera02);

    //Sphere 1
    var sphere01 = new AngularGL.Sphere({radius: 0.5});
    //sphere01.position.set(-1.5, 0, 0);
    scene.add(sphere01);

    //Sphere 2
    var sphere02 = new AngularGL.Sphere({radius: 0.5});
    sphere02.position.set(0.25, 0, 1);
    scene.add(sphere02);

    //Light
    var light = new AngularGL.SpotLight(0xffffff);
    light.position.set(4, 2.3, 2);
    light.shadowDarkness = 0.5;
    light.shadowCameraNear = 1;
    light.shadowCameraVisible = true;
    light.target = sphere01;
    scene.add(light);

    //Floor
    var floor = new AngularGL.Plane({side: 15, color: "silver"});
    floor.position.set(0, -0.5, 0);
    scene.add(floor);

    //Run scene
    scene.run();

    /*$scope.shadowMapType = 0;
    $scope.$watch("shadowMapType", function(shadowMapType) {
        console.log("shadowMapType: %d", shadowMapType);
        scene.renderer.shadowMapType = shadowMapType;
        floor.material.needsUpdate = true;
    });*/
}])
.controller("Prototype02Ctrl", ["$scope", "AngularGL", function($scope, AngularGL) {
    
    //Scene
    var scene = new AngularGL.Scene({domElementId: "canvas", scope: $scope, alpha: true});
    var WIDTH = scene.renderer.domElement.clientWidth;
    var HEIGHT = scene.renderer.domElement.clientHeight;

    //Axis Helper
    var axisHelper = new AngularGL.AxisHelper(150);
    //scene.add(axisHelper);
    
    //Primary Camera
    var camera01 = new AngularGL.PerspectiveCamera(45, 1, 1, 10000);
    //camera01.position.set(-6.8, 1, 7);
    //camera01.position.set(-26.45, 12.45, 36.25);
    //camera01.position.set(30.65, 18.80, 66.75);
    //camera01.position.set(-94.35, 7.70, 75.35);
    //camera01.position.set(-29, 9, 68.5);
    camera01.position.set(-80, 34, 90);
    camera01.lookAt(new AngularGL.Vector3(60, 8, 0));
    scene.add(camera01);
    //scene.controls.target.set(60, 8, 0);

    //Primary camera helper
    //var camera01_helper = new AngularGL.CameraHelper(camera01);
    //scene.add(camera01_helper);

    //Secondary camera
    var camera02 = new AngularGL.OrthographicCamera(-170, 220, 170, -170, 1, 1000);
    camera02.position.set(0, 1000, 0);
    //scene.add(camera02);

    //Floor
    var floorMirror = new THREE.Mirror(scene.renderer, camera01, {
        clipBias: 0.003,
        textureWidth: WIDTH,
        textureHeight: HEIGHT,
        color: "#777777",
        reflectivity: 0
    });
    var floor = new AngularGL.Plane({side: 300, color: "silver"/*"#151515"*/});
    //floor.material = floorMirror.material;
    floor.add(floorMirror);
    scene.add(floor);

    //Wall
    var wallColor = "#6a6a6a"
    var wall = new AngularGL.Cube({
        sides: [100, 100, 10],
        color: wallColor,
        shininess: 50,
        ambient: 0x444444,
        reflectivity: 1
    });
    var wallMirror = new THREE.Mirror(scene.renderer, camera01, {
        textureWidth: WIDTH,
        textureHeight: HEIGHT,
        color: wallColor,
        reflectivity: 0
    });
    wall.material = new AngularGL.MeshFaceMaterial([
        new AngularGL.MeshPhongMaterial({color: wallColor}),
        new AngularGL.MeshPhongMaterial({color: wallColor}),
        new AngularGL.MeshPhongMaterial({color: wallColor}),
        new AngularGL.MeshPhongMaterial({color: wallColor}),
        wallMirror.material,
        new AngularGL.MeshPhongMaterial({color: wallColor})
    ]);
    wall.add(wallMirror);
    wall.position.set(0, 50, -15);
    scene.add(wall);

    //Cube
    var cube = new AngularGL.Cube({side: 8, segments: 24, color: "#29ad33"});
    cube.position.set(30, 4, 1);
    scene.add(cube);
    
    //Balconies
    if(false) {
        //Balcony
        /*var cubeCamera = new AngularGL.CubeCamera(1, 1000, 1024);
    cubeCamera.position.set(30, 25, -6.25);
    scene.add(cubeCamera);*/
        var balconies = [];
        /*var balcony = new AngularGL.Mesh(
        new AngularGL.BoxGeometry(10, 5, 7.5),
        new AngularGL.MeshPhongMaterial({
            //envMap: cubeCamera.renderTarget
            color: "gray"
        }));*/
        var balcony = new AngularGL.Cube({color: "#6a6a6a"});
        balcony.geometry = new AngularGL.BoxGeometry(10, 5, 7.5);
        balcony.position.set(30, 25, -6.25);
        //balcony.scale.x = 2;
        //balcony.scale.z = 1.5;
        //balcony.receiveShadow = false;
        balcony.material = new THREE.ShaderMaterial({
            uniforms: {
                color: {type: "v3", value: new THREE.Vector3(106/255, 106/255, 106/255)}
            },
            vertexShader: document.getElementById("rtVert").textContent,
            fragmentShader: document.getElementById("rtFragA").textContent
        });
        balconies.push(balcony);
        scene.add(balconies);
    }

    //Post
    var posts = [];
    for(var i=50; i<=50; i+=50) {
        var post = new AngularGL.Mesh(
            new AngularGL.CylinderGeometry(0.5, 0.5, 18, 360),
            new AngularGL.MeshPhongMaterial({
                color: "silver"//"#121212"
            })
        );
        post.position.set(i, 9, 25);
        //Glass
        var glass = post.clone();
        glass.material = new AngularGL.MeshBasicMaterial({
            color: "#0ff",
            transparent: true,
            opacity: 0.5,
        });
        glass.scale.y = 1/9;
        glass.position.set(0, 10, 0);
        //Cap
        var cap = post.clone();
        cap.scale.y = 1/36;
        cap.position.set(0, 11.25, 0);
        //Lamp
        glass.add(new AngularGL.PointLight(0xffffff, 0.5));
        post.add(glass);
        post.add(cap);
        posts.push(post);
    }
    scene.add(posts);

    //Skybox
    scene.add(new AngularGL.SkyBox());
    
    //Sun
    scene.add(new AngularGL.Sun());
    
    //Run scene
    scene.run(function() {
        //floorMirror.renderWithMirror(wallMirror);
        wallMirror.render();
    });
    //Render scene
    //scene.render();

    //Animation
    var animation = new AngularGL.Animation(scene, function() {
        if(cube.position.x > 0) {
            //cube.rotation.y += 2 * Math.PI / 100; //approx 360° (2pi rad) in 5" (100f @20fps)
            cube.position.x -= 1;
        } else {
            if(this.loop) {
                this.prepareFn();
            } else {
                $scope.play = false;
                this.complete = true;
            }
        }
    }, function() {
        cube.position.x = 60;
    });

    //Toggle animation
    $scope.$watch("play", function(p) {
        animation.toggle(p);
    });

    //Toggle loop
    $scope.loop = true;
    $scope.$watch("loop", function(l) {
        animation.loop = l;
    });

    $scope.reset = animation.reset.bind(animation);
    $scope.step = animation.step.bind(animation);

    $scope.getCameraPosition = function() {
        var pos = $scope.camera.position;
        console.log("%s, %s, %s", pos.x.toFixed(2), pos.y.toFixed(2), pos.z.toFixed(2));
    };

    //TODO:
    //- slider to modify balcony's reflectivity

    //Da provare su sandbox editor di cryengine: scena simile a prototipo 2 (statica, senza animazioni, senza luce ambientale, luce puntiforme) verificare: riflessione. Contare i flops e paragonarli alla soluzione AngularGL.
    //Loggare tempi di rendering su vari browser, mappare su grafici.
    //Benchmarking prestazioni
    //Toggling uso CPU/GPU

}])
.controller("Prototype03Ctrl", ["$scope", "AngularGL", function($scope, AngularGL) {
    $scope.d = 2.0;
    $scope.r = 0.5;
    $scope.C = 4.0;

    //Scene
    var scene = new AngularGL.Scene({domElementId: "canvas", scope: $scope, alpha: true});

    //Grid Helper
    var gridHelper = new AngularGL.GridHelper(10000, 100);
    scene.add(gridHelper);

    //Axis Helper
    var axisHelper = new AngularGL.AxisHelper(15000);
    scene.add(axisHelper);

    //CD
    var cdFront, cdInner, cdBack;
    cdFront = new AngularGL.Ring({
        innerRadius: 17.5,
        outerRadius: 60,
        segments: 20,
    });
    cdFront.material = new AngularGL.MeshBasicMaterial({color: "#1200aa"});
    cdFront.geometry.applyMatrix(new AngularGL.Matrix4().makeTranslation(0, 0, AngularGL.EPSILON));
    cdInner = new AngularGL.Ring({
        innerRadius: 7.5,
        outerRadius: 17.5,
        segments: 20,
        color: "white",
        transparent: true,
        opacity: 0.2
    });
    cdBack = new AngularGL.Ring({
        innerRadius: 17.5,
        outerRadius: 60,
        segments: 20,
        color: "#befadc",
        transparent: false
    });
    cdBack.geometry.applyMatrix(new AngularGL.Matrix4().makeTranslation(0, 0, -AngularGL.EPSILON));
    _.each(cdBack.geometry.vertices, function(vertex) {
        var g = new THREE.Geometry();
        var A = cdBack.geometry.center().clone();
        var B = vertex.clone();
        g.vertices.push(A, B);
        var aTangent = new THREE.Line(g, new THREE.LineBasicMaterial({color: "yellow"}));
        aTangent.rotation.z = Math.PI / 2;
        vertex.aTangent = B;
    });
    cdBack.material = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib["lights"],
            {
                color : {
                    type: "v3",
                    value: new THREE.Vector3(190/255, 250/255, 220/255)
                },
                d: {
                    type: "f",
                    value: $scope.d
                },
                r: {
                    type: "f",
                    value: $scope.r
                },
                C: {
                    type: "f",
                    value: $scope.C
                },
            }
        ]),
        attributes: {
            aTangent: {
                type: "v3",
                value: _.pluck(cdBack.geometry.vertices, "aTangent")
            }
        },
        vertexShader: document.getElementById("vertShaderDiff").textContent,
        fragmentShader: document.getElementById("fragShaderDiff").textContent,
        side: THREE.BackSide,
        lights: true
    });
    /*$scope.$watch("d + r + C", function() {
        console.log($scope.d, $scope.r, $scope.C);
        _.each(["d", "r", "C"], function(uniform) {
            cdBack.material.uniforms[uniform] = {type: "f", value: $scope[uniform]};
        });
    });*/
    //cdBack.material.attributes.aTangent.needsUpdate = true;
    var cd = [cdFront, cdInner, cdBack];
    scene.add(cd);
    //scene.add(cdBack);

    //Primary Camera
    var camera = new AngularGL.PerspectiveCamera(45, 1, 0.1, 100000);
    camera.position.set(250, 50, 400);
    //camera.position.set(0, 0, 400);
    //camera.lookAt(cd.position);
    scene.add(camera);

    //Primary camera helper
    var camera_helper = new AngularGL.CameraHelper(camera);
    scene.add(camera_helper);

    //Light
    var light = new AngularGL.PointLight(0x404040, 0.5);
    light.position.set(0, 0, 300);
    scene.add(light);

    //Reset scene
    function reset() {
        _.each(cd, function(part) {
            if(part) {
                part.rotation.x = Math.PI;
            }
        });
    }

    //Run scene
    reset();
    scene.run();

    //Animation
    var animation = new AngularGL.Animation(scene, function() {
        _.each(cd, function(part, i) {
            if(part) {
                part.rotation.x = (part.rotation.x + 2 * Math.PI / 100) % (2 * Math.PI); //To prevent rotation value from sky-rocketing
            }
        });
    }, reset);

    //Toggle animation
    $scope.$watch("play", function(p) {
        animation.toggle(p);
    });

    //Toggle loop
    $scope.loop = true;
    $scope.$watch("loop", function(l) {
        animation.loop = l;
    });

    $scope.reset = animation.reset.bind(animation);
    $scope.step = animation.step.bind(animation);

}])
.controller("ThreeJsExampleCtrl", ["$scope", "$routeParams", function($scope, $routeParams) {
    var canvas = document.getElementById("canvas");

    var MARGIN = 0;

    var WIDTH = canvas.clientWidth || 2;
    var HEIGHT = canvas.clientHeight || ( 2 + 2 * MARGIN );

    var SCREEN_WIDTH = WIDTH;
    var SCREEN_HEIGHT = HEIGHT - 2 * MARGIN;

    var FAR = 10000;

    var DAY = 0;

    var container, controls;

    var camera, scene, renderer, renderTarget;

    var torus, mesh, geometry, increment = 1;

    var cubeCamera;

    var sunLight, pointLight, ambientLight;

    var morph;

    var composer, effectFXAA, hblur, vblur;

    var parameters, tweenDirection, tweenDay, tweenNight;

    var clock = new THREE.Clock();

    var gui, shadowConfig = {

        shadowCameraVisible: false,
        shadowCameraNear: 750,
        shadowCameraFar: 4000,
        shadowCameraFov: 30,
        shadowBias: -0.0002,
        shadowDarkness: 0.3

    };

    init();
    animate();

    function init() {

        // CAMERA
        camera = new THREE.PerspectiveCamera( 45, SCREEN_WIDTH / SCREEN_HEIGHT, 2, FAR );
        camera.position.set( 500, 400, 1200 );

        // SCENE
        scene = new THREE.Scene();

        // CUBE CAMERA
        cubeCamera = new THREE.CubeCamera( 1, FAR, 128 );
        scene.add( cubeCamera );

        // GROUND
        var groundMaterial = new THREE.MeshPhongMaterial( {
            shininess: 80,
            ambient: 0x444444,
            color: 0xffffff,
            specular: 0xffffff
        } );
        var planeGeometry = new THREE.PlaneBufferGeometry( 100, 100 );
        var ground = new THREE.Mesh( planeGeometry, groundMaterial );
        ground.position.set( 0, 0, 0 );
        ground.rotation.x = - Math.PI / 2;
        ground.scale.set( 1000, 1000, 1000 );
        ground.receiveShadow = true;
        scene.add( ground );

        // MATERIALS
        /*var shader = THREE.ShaderLib["cube"];
        shader.uniforms.tCube.texture = cubeCamera.renderTarget;
        //shader.uniforms["tFlip"].value = 1;
        var materialCube = new THREE.ShaderMaterial({
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms
        });*/
        var materialLambert = new THREE.MeshPhongMaterial( { shininess: 50, ambient: 0x444444, color: 0xffffff } );
        var materialPhong = new THREE.MeshPhongMaterial( { shininess: 50, ambient: 0x444444, color: 0xffffff, specular: 0x999999 } );
        var materialPhongCube = new THREE.MeshPhongMaterial( { shininess: 50, ambient: 0x444444, color: 0xffffff, specular: 0x999999, envMap: cubeCamera.renderTarget } );

        // OBJECTS
        var sphereGeometry = new THREE.SphereGeometry( 100, 64, 32 );
        var torusGeometry = new THREE.TorusGeometry( 240, 60, 32, 64 );
        var cubeGeometry = new THREE.BoxGeometry( 150, 150, 150 );

        torus = addObject( torusGeometry, materialPhong, 0, 100, 0, 0 );
        //addObject( cubeGeometry, materialLambert, 350, 75, 300, 0 );
        var myGeometry;
        if($routeParams.geometry === "box") {
            myGeometry = new THREE.BoxGeometry(500, 500, 50);
        } else {
            myGeometry = new THREE.SphereGeometry(100, 64, 32);
        }
        mesh = addObject( myGeometry, materialPhongCube, 350, 100, -350, 0 );

        function addObjectColor( geometry, color, x, y, z, ry ) {
            var material = new THREE.MeshPhongMaterial( { color: 0xffffff, ambient: 0x444444 } );
            return addObject( geometry, material, x, y, z, ry );
        }

        function addObject( geometry, material, x, y, z, ry ) {

            var tmpMesh = new THREE.Mesh( geometry, material );

            tmpMesh.material.color.offsetHSL( 0.1, -0.1, 0 );

            tmpMesh.position.set( x, y, z );

            tmpMesh.rotation.y = ry;

            tmpMesh.castShadow = true;
            tmpMesh.receiveShadow = true;

            scene.add( tmpMesh );

            return tmpMesh;

        }

        var bigCube = new THREE.BoxGeometry( 500, 500, 50 );
        var midCube = new THREE.BoxGeometry( 50, 200, 50 );
        var smallCube = new THREE.BoxGeometry( 100, 100, 100 );

        addObjectColor( midCube,   0xff00ff, 0, 100, 500, 0 );
        addObjectColor( smallCube, 0xff00ff, -150, 50, 500, 0 );

        addObjectColor( new THREE.SphereGeometry( 100, 32, 26 ), 0xffffff, -300, 100, 300, 0 );

        // LIGHTS
        var sunIntensity = 0.3,
            pointIntensity = 1,
            pointColor = 0xffaa00;

        ambientLight = new THREE.AmbientLight( 0x3f2806 );
        //scene.add( ambientLight );

        pointLight = new THREE.PointLight( 0xffaa00, pointIntensity, 5000 );
        pointLight.position.set( 0, 0, 0 );
        scene.add( pointLight );

        sunLight = new THREE.SpotLight( 0xffffff, sunIntensity, 0, Math.PI/2, 1 );
        sunLight.position.set( 1000, 2000, 1000 );

        sunLight.castShadow = true;

        sunLight.shadowDarkness = 0.3 * sunIntensity;
        sunLight.shadowBias = -0.0002;

        sunLight.shadowCameraNear = 750;
        sunLight.shadowCameraFar = 4000;
        sunLight.shadowCameraFov = 30;

        sunLight.shadowCameraVisible = false;

        scene.add( sunLight );

        scene.add(new THREE.AxisHelper(300));
        
        // RENDERER
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: canvas
        });
        renderer.setClearColor( 0x000000/*scene.fog.color, 1*/ );
        renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

        //
        renderer.shadowMapEnabled = true;
        renderer.shadowMapType = THREE.PCFSoftShadowMap;

        //
        renderer.gammaInput = true;
        renderer.gammaOutput = true;

        //
        controls = new THREE.OrbitControls( camera, renderer.domElement );

    }

    function animate() {
        requestAnimationFrame( animate );
        if(Math.abs(torus.position.x) === 350) {
            increment = -increment;
        }
        torus.position.x+=increment*10;
        render();
    }

    function render() {

        controls.update();

        // render cube map & scene
        mesh.visible = false;
        cubeCamera.position.copy( mesh.position );
        cubeCamera.updateCubeMap( renderer, scene );
        mesh.visible = true;

        renderer.render( scene, camera );

    }
}])
.controller("ThreeJsExampleCtrlFuffa", ["$scope", function($scope) {
    var camera, scene, renderer,
        particle1, particle2, particle2,
        light1, light2, light3,
        loader, mesh;

    init();
    animate();

    function init() {

        var canvas = document.getElementById("canvas");
        var WIDTH = canvas.clientWidth;
        var HEIGHT = canvas.clientHeight;

        camera = new THREE.PerspectiveCamera(60, WIDTH / HEIGHT, 1, 1000);
        camera.position.set(0, -6, 50);

        scene = new THREE.Scene();

        mesh = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({
            color: 0xff0000,
            envMap: THREE.ImageUtils.loadTexture("js/libs/angulargl/textures/bricks1.png", new THREE.SphericalReflectionMapping()),
            overdraw: 0.5
        }));
        scene.add( mesh );

        renderer = new THREE.CanvasRenderer();
        canvas.appendChild(renderer.domElement);
        renderer.setSize(WIDTH, HEIGHT);

        //window.addEventListener( 'resize', onWindowResize, false );

    }

    /*function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }*/

    //

    function animate() {

        requestAnimationFrame( animate );
        render();

    }

    function render() {

        var time = Date.now() * 0.0005;
        if ( mesh ) mesh.rotation.y -= 0.01;
        renderer.render( scene, camera );

    }

}])
.controller("CustomShaderCtrl", ["$scope", function($scope) {
    // standard global variables
    var scene, camera, renderer, controls;
    var canvas = document.getElementById("canvas");

    // Character 3d object
    var character = null;

    // FUNCTIONS
    function init() {
        // SCENE
        scene = new THREE.Scene();

        // CAMERA
        var SCREEN_WIDTH = canvas.clientWidth,
            SCREEN_HEIGHT = canvas.clientHeight,
            VIEW_ANGLE = 45,
            ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
            NEAR = 0.1, FAR = 1000;

        camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        scene.add(camera);
        camera.position.set(0,0,5);
        camera.lookAt(scene.position);

        //CONTROLS
        controls = new THREE.OrbitControls(camera, canvas);

        // RENDERER
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            canvas: canvas
        });
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

        // Main polygon
        character = buildCharacter();
        scene.add(character);

        // Create light
        var light = new THREE.PointLight(0xffffff, 1.0);
        // We want it to be very close to our character
        light.position.set(0.2,0.2,0.1);
        scene.add(light)

        // Start animation
        animate();
    }

    var buildCharacter = (function() {
        var _geo = null;
        var creatureImage = THREE.ImageUtils.loadTexture("img/textures/imp.png");
        creatureImage.magFilter = THREE.NearestFilter;

        // Share the same geometry across all planar objects
        function getPlaneGeometry() {
            if(_geo == null) {
                _geo = new THREE.PlaneBufferGeometry(1.0, 1.0);
            }

            return _geo;
        };

        return function() {
            var g = getPlaneGeometry();
            var mat = new THREE.ShaderMaterial({
                uniforms: THREE.UniformsUtils.merge([
                    THREE.UniformsLib['lights'],
                    {
                        color: {type: 'f', value: 0.0},
                        evilCreature: {type: 't', value: null}
                    }
                ]),
                vertexShader: document.getElementById('vertShader').text,
                fragmentShader: document.getElementById('fragShader').text,
                transparent: true,
                lights: true
            });
            mat.uniforms.evilCreature.value = creatureImage;

            var obj = new THREE.Mesh(g, mat);
            return obj;
        }
    })();

    function animate() {
        requestAnimationFrame( animate );
        // Update uniform
        var c = 0.5 + 0.5 * Math.cos(new Date().getTime()/1000.0 * Math.PI);
        character.material.uniforms.color.value = c;
        // Render scene
        renderer.render( scene, camera );
        controls.update();
    }

    init();
}]);