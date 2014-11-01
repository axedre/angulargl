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
    var sphere01 = new AngularGL.Sphere(0.5);
    //sphere01.position.set(-1.5, 0, 0);
    scene.add(sphere01);

    //Sphere 2
    var sphere02 = new AngularGL.Sphere(0.5);
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
    var floor = new AngularGL.Plane(15, "silver");
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
    //var texture = AngularGL.ImageUtils.loadTexture('img/textures/2294472375_24a3b8ef46_o.jpg', new THREE.UVMapping(), function () {
    //Scene
    var scene = new AngularGL.Scene("canvas", $scope, true);

    /*var mesh = new THREE.Mesh(
        new THREE.SphereGeometry(500, 60, 40),
        new THREE.MeshBasicMaterial({
            map: texture
        })
    );
    mesh.scale.x = -1;
    scene.add( mesh );*/

    //Axis Helper
    var axisHelper = new AngularGL.AxisHelper(150);
    scene.add(axisHelper);

    //Primary Camera
    var camera01 = new AngularGL.PerspectiveCamera(45, 1, 1, 1000);
    //camera01.position.set(-6.8, 1, 7);
    //camera01.position.set(-26.45, 12.45, 36.25);
    camera01.position.set(30.65, 18.80, 66.75);
    scene.add(camera01);
    scene.controls.target.set(30.65, 18.80, 0);

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
    var cube = new AngularGL.Cube(10, "#29ad33");
    //cube.material = new AngularGL.MeshBasicMaterial({color: "#29ad33"});
    //cube.position.set(120, 25, 5);
    cube.position.set(26, 25, 10);
    //cube.position.set(120, 5, 1);
    scene.add(cube);

    //Light
    var lightTarget = new AngularGL.Object3D();
    lightTarget.position.set(50, 0, -5);

    var light = new AngularGL.SpotLight(0xffffff);
    //light.position.set(50, 20, -5);
    light.shadowDarkness = 0.5;
    light.shadowCameraNear = 1;
    light.shadowCameraFar = 20;
    light.shadowCameraVisible = true;
    light.position.y = 20;
    light.onlyShadow = true;
    light.angle = Math.PI/2;
    light.target = lightTarget;
    light.add(new AngularGL.PointLight(0xffffff, 0.5));
    
    lightTarget.add(light);
    scene.add(lightTarget);

    //Floor
    var floor = new AngularGL.Plane(300, "silver");
    scene.add(floor);

    //Wall
    var wall = new AngularGL.Cube(100, "#6a6a6a");
    /*wall.material = new AngularGL.MeshBasicMaterial({
            color: "#e2e25a"
        });*/
    wall.position.set(0, 50, -15);
    wall.scale.z = 0.1;
    scene.add(wall);

    //Balcony
    var cubeCamera = new AngularGL.CubeCamera(1, 1000, 1024);
    cubeCamera.position.set(30, 25, -6.25);
    scene.add(cubeCamera);

    var balcony = new AngularGL.Mesh(
        new AngularGL.BoxGeometry(10, 5, 7.5),
        new AngularGL.MeshBasicMaterial({
            envMap: cubeCamera.renderTarget
        })
    );
    balcony.position.set(30, 25, -6.25);
    //balcony.scale.x = 2;
    //balcony.scale.z = 1.5;
    //balcony.receiveShadow = false;
    scene.add(balcony);

    //Run scene
    scene.run();

    //Animation
    var animation = new AngularGL.Animation(scene, function() {
        if(cube.position.x > -30) {
            //cube.rotation.y += 2 * Math.PI / 100; //approx 360° (2pi rad) in 5" (100f @20fps)
            cube.position.x -= 5;
        } else {
            if(this.loop) {
                this.prepareFn();
            } else {
                $scope.play = false;
                this.complete = true;
            }
        }
    }, function() {
        cube.position.x = 120;
    });

    //Toggle animation
    $scope.$watch("play", function(p) {
        animation.toggle(p);
    });
    
    //Toggle loop
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
    var gridHelper = new AngularGL.GridHelper(10, 1);
    scene.add(gridHelper);

    //Axis Helper
    var axisHelper = new AngularGL.AxisHelper(15);
    scene.add(axisHelper);

    //CD
    var cd;

    //Primary Camera
    var camera = new AngularGL.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 1, 2);
    //camera.lookAt(cd.position);
    scene.add(camera);

    //Primary camera helper
    var camera_helper = new AngularGL.CameraHelper(camera);
    scene.add(camera_helper);

    //Floor
    var floor = new AngularGL.Plane(30, "silver");
    //scene.add(floor);

    //Run scene
    scene.run();

}])
.controller("ThreeJsExampleCtrl", ["$scope", function($scope) {
    var canvas = document.getElementById("canvas");
    var camera, cubeCamera, scene, renderer, controls, light;
    var cube, sphere, torus;
    var WIDTH = canvas.clientWidth;
    var HEIGHT = canvas.clientHeight;

    var fov = 70,
        isUserInteracting = false,
        onMouseDownMouseX = 0, onMouseDownMouseY = 0,
        lon = 0, onMouseDownLon = 0,
        lat = 0, onMouseDownLat = 0,
        phi = 0, theta = 0;

    var texture = THREE.ImageUtils.loadTexture( 'img/textures/2294472375_24a3b8ef46_o.jpg', new THREE.UVMapping(), function () {

        init();
        animate();

    } );

    function init() {

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( fov, WIDTH / HEIGHT, 1, 1000 );
        camera.position.set(100, 100, 100);

        var mesh = new THREE.Mesh( new THREE.SphereGeometry( 500, 60, 40 ), new THREE.MeshBasicMaterial( { map: texture } ) );
        mesh.scale.x = -1;
        scene.add( mesh );

        renderer = new THREE.WebGLRenderer( { antialias: true, canvas: canvas } );
        renderer.setSize( WIDTH, HEIGHT );

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.copy(scene.position);

        cubeCamera = new THREE.CubeCamera( 1, 1000, 256 );
        //cubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
        scene.add( cubeCamera );

        cube = new THREE.Mesh(
            new THREE.BoxGeometry( 100, 100, 100 ),
            new THREE.MeshBasicMaterial({
                envMap: cubeCamera.renderTarget
            })
        );
        scene.add( cube );

        /*document.addEventListener( 'mousedown', onDocumentMouseDown, false );
        document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
        document.addEventListener( 'DOMMouseScroll', onDocumentMouseWheel, false);
        window.addEventListener( 'resize', onWindowResized, false );

        onWindowResized( null );*/

    }

    /*function onWindowResized( event ) {

        renderer.setSize( WIDTH, HEIGHT );
        camera.projectionMatrix.makePerspective( fov, WIDTH / HEIGHT, 1, 1100 );
    }

    function onDocumentMouseDown( event ) {

        event.preventDefault();

        onPointerDownPointerX = event.clientX;
        onPointerDownPointerY = event.clientY;

        onPointerDownLon = lon;
        onPointerDownLat = lat;

        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        document.addEventListener( 'mouseup', onDocumentMouseUp, false );

    }

    function onDocumentMouseMove( event ) {

        lon = ( event.clientX - onPointerDownPointerX ) * 0.1 + onPointerDownLon;
        lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;

    }

    function onDocumentMouseUp( event ) {

        document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
        document.removeEventListener( 'mouseup', onDocumentMouseUp, false );

    }

    function onDocumentMouseWheel( event ) {

        // WebKit

        if ( event.wheelDeltaY ) {

            fov -= event.wheelDeltaY * 0.05;

            // Opera / Explorer 9

        } else if ( event.wheelDelta ) {

            fov -= event.wheelDelta * 0.05;

            // Firefox

        } else if ( event.detail ) {

            fov += event.detail * 1.0;

        }

        camera.projectionMatrix.makePerspective( fov, WIDTH / HEIGHT, 1, 1100 );

    }*/

    function animate() {

        requestAnimationFrame( animate );
        render();
        controls.update();
    }

    function render() {

        var time = Date.now();

        lon += .15;

        lat = Math.max( - 85, Math.min( 85, lat ) );
        phi = THREE.Math.degToRad( 90 - lat );
        theta = THREE.Math.degToRad( lon );

        /*sphere.position.x = Math.sin( time * 0.001 ) * 30;
        sphere.position.y = Math.sin( time * 0.0011 ) * 30;
        sphere.position.z = Math.sin( time * 0.0012 ) * 30;

        sphere.rotation.x += 0.02;
        sphere.rotation.y += 0.03;

        cube.position.x = Math.sin( time * 0.001 + 2 ) * 30;
        cube.position.y = Math.sin( time * 0.0011 + 2 ) * 30;
        cube.position.z = Math.sin( time * 0.0012 + 2 ) * 30;

        cube.rotation.x += 0.02;
        cube.rotation.y += 0.03;

        torus.position.x = Math.sin( time * 0.001 + 4 ) * 30;
        torus.position.y = Math.sin( time * 0.0011 + 4 ) * 30;
        torus.position.z = Math.sin( time * 0.0012 + 4 ) * 30;

        torus.rotation.x += 0.02;
        torus.rotation.y += 0.03;*/

        /*camera.position.x = 100;// * Math.sin( phi ) * Math.cos( theta );
        //camera.position.y = 100 * Math.cos( phi );
        camera.position.z = 100;// * Math.sin( phi ) * Math.sin( theta );

        camera.lookAt( scene.position );*/

        //sphere.visible = false; // *cough*

        cubeCamera.updateCubeMap( renderer, scene );

        //sphere.visible = true; // *cough*

        renderer.render( scene, camera );

    }

}])
.controller("ThreeJsCtrlOld", [function() {
    var container, scene, camera, renderer, controls, stats;
    var sphere, cube, floor;

    //Scene
    scene = new THREE.Scene();

    //Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.z = 3;
    camera.position.y = 0.75;

    //Renderer
    var canvas = document.getElementById("canvas");
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvas
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    //Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    //Light
    var light = new THREE.PointLight(0xffffff);
    light.position.set(5, 5, 5);
    //scene.add(light);
    var ambientLight = new AngularGL.AmbientLight(0x111111);
    //scene.add(ambientLight);

    //Sphere	
    var sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32); 
    var sphereMaterial = new THREE.MeshPhongMaterial({color: 0x8888ff}); 
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(1.5, 0, 0);
    //scene.add(sphere);

    //Cube
    var cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    /*var cubeMaterialArray = [
        new AngularGL.MeshLambertMaterial({color: 0xff3333}),
        new AngularGL.MeshLambertMaterial({color: 0xff8800}),
        new AngularGL.MeshLambertMaterial({color: 0xffff33}),
        new AngularGL.MeshLambertMaterial({color: 0x33ff33}),
        new AngularGL.MeshLambertMaterial({color: 0x3333ff}),
        new AngularGL.MeshLambertMaterial({color: 0x8833ff})
    ];
    var cubeMaterials = new AngularGL.MeshFaceMaterial(cubeMaterialArray);*/
    var cubeMaterial = new THREE.MeshPhongMaterial({color: "#29ad33"});
    // using THREE.MeshFaceMaterial() in the constructor below
    // causes the mesh to use the materials stored in the geometry
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.y = 0;
    //scene.add(cube);		

    //Axes
    //var axes = new THREE.AxisHelper(100);
    //scene.add(axes);

    //Floor
    // note: 4x4 checkboard pattern scaled so that each square is 25 by 25 pixels.
    /*var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
        floorTexture.repeat.set( 10, 10 );*/
    // DoubleSide: render texture on both sides of mesh
    var floorGeometry = new THREE.PlaneGeometry(10, 10);
    var floorMaterial = new THREE.MeshBasicMaterial({
        color: "silver",
        wireframe: false
    });
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    //scene.add(floor);

    /*
    //Sky
    // recommend either a skybox or fog effect (can't use both at the same time) 
    // without one of these, the scene's background color is determined by webpage background
    // make sure the camera's "far" value is large enough so that it will render the skyBox!
    //var skyBoxGeometry = new THREE.BoxGeometry(10000, 10000, 10000);
    // BackSide: render faces from inside of the cube, instead of from outside (default).
    //var skyBoxMaterial = new THREE.MeshBasicMaterial({color: 0x9999ff, side: THREE.BackSide});
    //var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    // scene.add(skyBox);
    // fog must be added to scene before first render
    //scene.fog = new THREE.FogExp2(0x9999ff, 0.00025);
    */

    scene.add.apply(scene, [
        cube,
        light,
        camera,
        sphere,
        floor
    ]);

    function animate() {
        requestAnimationFrame( animate );
        render();		
        update();
    }

    function update() {
        controls.update();
        //stats.update();
    }

    function render() {	
        renderer.render(scene, camera);
    }

    animate();

}]);