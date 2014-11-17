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
    var scene = new AngularGL.Scene("canvas", $scope);

    //Floor
    var floor = new AngularGL.Plane({side: 300, color: "#151515"});
    scene.add(floor);

    //Axis Helper
    var axisHelper = new AngularGL.AxisHelper(150);
    scene.add(axisHelper);

    //Primary Camera
    var camera01 = new AngularGL.PerspectiveCamera(45, 1, 1, 1000);
    //camera01.position.set(-6.8, 1, 7);
    //camera01.position.set(-26.45, 12.45, 36.25);
    //camera01.position.set(30.65, 18.80, 66.75);
    //camera01.position.set(-94.35, 7.70, 75.35);
    camera01.position.set(-29, 9, 68.5);
    camera01.lookAt(new AngularGL.Vector3(60, 8, 0));
    scene.add(camera01);
    //scene.controls.target.set(60, 8, 0);

    //Primary camera helper
    //var camera01_helper = new AngularGL.CameraHelper(camera01);
    //scene.add(camera01_helper);

    //Secondary camera
    var camera02 = new AngularGL.OrthographicCamera(-170, 220, 170, -170, 1, 1000);
    camera02.position.set(0, 1000, 0);
    scene.add(camera02);

    /*//Third camera
    var camera03 = new AngularGL.PerspectiveCamera(45, 1, 0.1, 1000);
    camera03.position.set(1.85, 4.55, -38.20);
    scene.add(camera03);
    //scene.controls.target.set(35, 15, -6);*/

    //Cube
    var cube = new AngularGL.Cube({side: 8, segments: 24, color: "#29ad33"});
    //cube.material = new AngularGL.MeshPhongMaterial({color: "#29ad33"});
    //Cube normals
    //var cubeNormalsHelper = new THREE.FaceNormalsHelper(cube, 2, 0xffff00);
    //cube.add(cubeNormalsHelper);
    //cube.position.set(120, 25, 5);
    //cube.position.set(26, 25, 10);
    cube.position.set(60, 4, 1);
    scene.add(cube);

    //Wall
    var wall = new AngularGL.Cube({side: 100, color: "#6a6a6a"});
    /*wall.material = new AngularGL.MeshBasicMaterial({
        color: "#e2e25a"
    });*/
    wall.position.set(0, 50, -15);
    wall.scale.z = 0.1;
    scene.add(wall);

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
    var balcony = new AngularGL.Cube({color: "gray"});
    balcony.geometry = new AngularGL.BoxGeometry(10, 5, 7.5);
    balcony.position.set(30, 25, -6.25);
    //balcony.scale.x = 2;
    //balcony.scale.z = 1.5;
    //balcony.receiveShadow = false;
    balconies.push(balcony);
    scene.add(balconies);

    //Lamp posts
    /* TODO:
    AngularGL.Object3D.load("objects/lamp.js", function(lamp) {
        //console.log(lamp);
        scene.add(lamp);
    });
    */

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

    //Run scene
    //scene.run();
    //Render scene
    scene.render();

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
    //Scene
    var scene = new AngularGL.Scene("canvas", $scope);

    //Grid Helper
    var gridHelper = new AngularGL.GridHelper(10000, 100);
    scene.add(gridHelper);

    //Axis Helper
    var axisHelper = new AngularGL.AxisHelper(15000);
    scene.add(axisHelper);

    //CD
    var cdFront = new AngularGL.Ring({
        innerRadius: 17.5,
        outerRadius: 60,
        segments: 20,
    });
    cdFront.material = new AngularGL.MeshBasicMaterial({color: "#1200aa"});
    cdFront.geometry.applyMatrix(new AngularGL.Matrix4().makeTranslation(0, 0, AngularGL.EPSILON));
    var cdInner = new AngularGL.Ring({
        innerRadius: 7.5,
        outerRadius: 17.5,
        segments: 20,
        color: "white",
        transparent: true,
        opacity: 0.2
    });
    var cdBack = new AngularGL.Ring({
        innerRadius: 17.5,
        outerRadius: 60,
        segments: 20,
        color: "#befadc",
        transparent: false
    });
    //cdBack.material = new AngularGL.MeshBasicMaterial({color: "blue", wireframe: true, side: AngularGL.BackSide});
    cdBack.geometry.applyMatrix(new AngularGL.Matrix4().makeTranslation(0, 0, -AngularGL.EPSILON));
    _.each(cdBack.geometry.vertices, function(vertex) {
        var g = new THREE.Geometry();
        var A = cdBack.geometry.center().clone();
        var B = vertex.clone();
        g.vertices.push(A, B);
        var tangent = new THREE.Line(g, new THREE.LineBasicMaterial({color: "yellow"}));
        tangent.rotation.z = Math.PI / 2;
        vertex.tangent = B;//tangent;
    });
    cdBack.material = new THREE.RawShaderMaterial({
        uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib["lights"]
        ])/*,
        attributes: {
            tangent: {type: "v3", value: _.pluck(cdBack.geometry.vertices, "tangent")}
        }*/,
        vertexShader: document.getElementById("vertShaderDiff").text,
        fragmentShader: document.getElementById("fragShaderDiff").text,
        side: THREE.BackSide,
        lights: true,
        vertexColors: THREE.VertexColors
    });
    //cdBack.material.attributes.tangent.needsUpdate = true;
    console.log(cdBack.geometry);
    console.log(cdBack.material);
    var cd = [cdFront, cdInner, cdBack];
    scene.add(cd);

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
    //scene.add(new AngularGL.AmbientLight(0x404040));


    //Reset scene
    function reset() {
        _.each(cd, function(part) {
            part.rotation.x = Math.PI;
        });
    }

    //Run scene
    reset();
    scene.run();

    //Animation
    var animation = new AngularGL.Animation(scene, function() {
        _.each(cd, function(part, i) {
            part.rotation.x = (part.rotation.x + 2 * Math.PI / 100) % (2 * Math.PI); //To prevent rotation value from sky-rocketing
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
.controller("ThreeJsExampleCtrl", ["$scope", function($scope) {
    var canvas = document.getElementById("canvas");

    var MARGIN = 0;

    var WIDTH = canvas.clientWidth || 2;
    var HEIGHT = canvas.clientHeight || ( 2 + 2 * MARGIN );

    var SCREEN_WIDTH = WIDTH;
    var SCREEN_HEIGHT = HEIGHT - 2 * MARGIN;

    var FAR = 10000;

    var DAY = 0;

    var container, stats;

    var camera, scene, renderer;

    var mesh, geometry;

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

        var shader = THREE.ShaderLib[ "cube" ];
        shader.uniforms[ "tCube" ].texture = cubeCamera.renderTarget;
        shader.uniforms[ "tFlip" ].value = 1;

        var materialCube = new THREE.ShaderMaterial( {

            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms

        } );

        var materialLambert = new THREE.MeshPhongMaterial( { shininess: 50, ambient: 0x444444, color: 0xffffff, map: textureNoiseColor } );
        var materialPhong = new THREE.MeshPhongMaterial( { shininess: 50, ambient: 0x444444, color: 0xffffff, specular: 0x999999, map: textureLava } );
        var materialPhongCube = new THREE.MeshPhongMaterial( { shininess: 50, ambient: 0x444444, color: 0xffffff, specular: 0x999999, envMap: cubeCamera.renderTarget } );

        // OBJECTS

        var sphereGeometry = new THREE.SphereGeometry( 100, 64, 32 );
        var torusGeometry = new THREE.TorusGeometry( 240, 60, 32, 64 );
        var cubeGeometry = new THREE.BoxGeometry( 150, 150, 150 );

        addObject( torusGeometry, materialPhong, 0, 100, 0, 0 );
        addObject( cubeGeometry, materialLambert, 350, 75, 300, 0 );
        mesh = addObject( sphereGeometry, materialPhongCube, 350, 100, -350, 0 );

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

        var bigCube = new THREE.BoxGeometry( 50, 500, 50 );
        var midCube = new THREE.BoxGeometry( 50, 200, 50 );
        var smallCube = new THREE.BoxGeometry( 100, 100, 100 );

        addObjectColor( bigCube,   0xff0000, -500, 250, 0, 0 );
        addObjectColor( smallCube, 0xff0000, -500, 50, -150, 0 );

        addObjectColor( midCube,   0x00ff00, 500, 100, 0, 0 );
        addObjectColor( smallCube, 0x00ff00, 500, 50, -150, 0 );

        addObjectColor( midCube,   0x0000ff, 0, 100, -500, 0 );
        addObjectColor( smallCube, 0x0000ff, -150, 50, -500, 0 );

        addObjectColor( midCube,   0xff00ff, 0, 100, 500, 0 );
        addObjectColor( smallCube, 0xff00ff, -150, 50, 500, 0 );

        addObjectColor( new THREE.BoxGeometry( 500, 10, 10 ), 0xffff00, 0, 600, 0, Math.PI/4 );
        addObjectColor( new THREE.BoxGeometry( 250, 10, 10 ), 0xffff00, 0, 600, 0, 0 );

        addObjectColor( new THREE.SphereGeometry( 100, 32, 26 ), 0xffffff, -300, 100, 300, 0 );

        // MORPHS

        var loader = new THREE.JSONLoader();

        loader.load( "models/animated/sittingBox.js", function( geometry ) {

            var morphMaterial = new THREE.MeshPhongMaterial( { ambient: 0x000000, color: 0x000000, specular: 0xff9900, shininess: 50, morphTargets: true, morphNormals: true, side: THREE.DoubleSide } );
            morphMaterial.shading = THREE.FlatShading;

            geometry.computeMorphNormals();
            morph = new THREE.MorphAnimMesh( geometry, morphMaterial );

            var s = 200;
            morph.scale.set( s, s, s );

            morph.duration = 8000;
            morph.mirroredLoop = true;

            morph.castShadow = true;
            morph.receiveShadow = true;

            scene.add( morph );

        } );

        // LIGHTS

        var sunIntensity = 0.3,
            pointIntensity = 1,
            pointColor = 0xffaa00;

        if ( DAY ) {

            sunIntensity = 1;
            pointIntensity = 0.5;
            pointColor = 0xffffff;

        }

        ambientLight = new THREE.AmbientLight( 0x3f2806 );
        scene.add( ambientLight );

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

        // RENDERER

        renderer = new THREE.WebGLRenderer( { antialias: false } );
        renderer.setClearColor( scene.fog.color, 1 );
        renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

        renderer.domElement.style.position = "absolute";
        renderer.domElement.style.top = MARGIN + "px";
        renderer.domElement.style.left = "0px";

        container.appendChild( renderer.domElement );

        //

        renderer.shadowMapEnabled = true;
        renderer.shadowMapType = THREE.PCFSoftShadowMap;

        //

        renderer.gammaInput = true;
        renderer.gammaOutput = true;

        //

        controls = new THREE.TrackballControls( camera, renderer.domElement );
        controls.target.set( 0, 120, 0 );

        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;

        controls.noZoom = false;
        controls.noPan = false;

        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.15;

        controls.keys = [ 65, 83, 68 ];


        // STATS

        stats = new Stats();
        container.appendChild( stats.domElement );

        // EVENTS

        window.addEventListener( 'resize', onWindowResize, false );
        document.addEventListener( 'keydown', onKeyDown, false );

        // COMPOSER

        renderer.autoClear = false;

        var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
        renderTarget = new THREE.WebGLRenderTarget( SCREEN_WIDTH, SCREEN_HEIGHT, renderTargetParameters );

        effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
        var effectVignette = new THREE.ShaderPass( THREE.VignetteShader );

        hblur = new THREE.ShaderPass( THREE.HorizontalTiltShiftShader );
        vblur = new THREE.ShaderPass( THREE.VerticalTiltShiftShader );

        var bluriness = 4;

        hblur.uniforms[ 'h' ].value = bluriness / SCREEN_WIDTH;
        vblur.uniforms[ 'v' ].value = bluriness / SCREEN_HEIGHT;

        hblur.uniforms[ 'r' ].value = vblur.uniforms[ 'r' ].value = 0.5;

        effectFXAA.uniforms[ 'resolution' ].value.set( 1 / SCREEN_WIDTH, 1 / SCREEN_HEIGHT );

        composer = new THREE.EffectComposer( renderer, renderTarget );

        var renderModel = new THREE.RenderPass( scene, camera );

        effectVignette.renderToScreen = true;
        vblur.renderToScreen = true;
        effectFXAA.renderToScreen = true;

        composer = new THREE.EffectComposer( renderer, renderTarget );

        composer.addPass( renderModel );

        composer.addPass( effectFXAA );

        //composer.addPass( hblur );
        //composer.addPass( vblur );

        //composer.addPass( effectVignette );

        // TWEEN

        parameters = { control: 0 };

        tweenDirection = -1;

        tweenDay = new TWEEN.Tween( parameters ).to( { control: 1 }, 1000 ).easing( TWEEN.Easing.Exponential.Out );
        tweenNight = new TWEEN.Tween( parameters ).to( { control: 0 }, 1000 ).easing( TWEEN.Easing.Exponential.Out );

        // GUI

        gui = new dat.GUI();

        gui.add( shadowConfig, 'shadowCameraVisible' ).onChange( function() {

            sunLight.shadowCameraVisible = shadowConfig.shadowCameraVisible;

        });

        gui.add( shadowConfig, 'shadowCameraNear', 1, 1500 ).onChange( function() {

            sunLight.shadowCamera.near = shadowConfig.shadowCameraNear;
            sunLight.shadowCamera.updateProjectionMatrix();

        });

        gui.add( shadowConfig, 'shadowCameraFar', 1501, 5000 ).onChange( function() {

            sunLight.shadowCamera.far = shadowConfig.shadowCameraFar;
            sunLight.shadowCamera.updateProjectionMatrix();

        });

        gui.add( shadowConfig, 'shadowCameraFov', 1, 120 ).onChange( function() {

            sunLight.shadowCamera.fov = shadowConfig.shadowCameraFov;
            sunLight.shadowCamera.updateProjectionMatrix();

        });

        gui.add( shadowConfig, 'shadowBias', -0.01, 0.01 ).onChange( function() {

            sunLight.shadowBias = shadowConfig.shadowBias;

        });

        gui.add( shadowConfig, 'shadowDarkness', 0, 1 ).onChange( function() {

        });

        gui.close();

    }

    function animate() {

        requestAnimationFrame( animate );

        render();
        stats.update();

    }

    function render() {

        // update

        var delta = 1000 * clock.getDelta();

        TWEEN.update();
        controls.update();

        if ( morph ) morph.updateAnimation( delta );

        scene.fog.color.setHSL( 0.63, 0.05, parameters.control );
        renderer.setClearColor( scene.fog.color, 1 );

        sunLight.intensity = parameters.control * 0.7 + 0.3;
        pointLight.intensity = - parameters.control * 0.5 + 1;

        pointLight.color.setHSL( 0.1, 0.75, parameters.control * 0.5 + 0.5 );

        sunLight.shadowDarkness = shadowConfig.shadowDarkness * sunLight.intensity;

        // render cube map

        mesh.visible = false;

        renderer.autoClear = true;
        cubeCamera.position.copy( mesh.position );
        cubeCamera.updateCubeMap( renderer, scene );
        renderer.autoClear = false;

        mesh.visible = true;

        // render scene

        //renderer.render( scene, camera );
        //renderer.clearTarget( null, 1, 1, 1 );
        composer.render( 0.1 );

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