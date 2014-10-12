"use strict";

angular.module("AngularGLApp.controllers", ["AngularGL"])
.controller("MainCtrl", ["$scope", "AngularGL", function($scope, AngularGL) {
    $scope.ambientLightColor = "#ff0000";
    $scope.directionalLightColor = "#ff00ff";
    $scope.directionalLightPosition = [0, 1, 0];

    //Scene
    var scene = new AngularGL.Scene("canvas");
    
    //Cube
    var cube = new AngularGL.Mesh(
        new AngularGL.BoxGeometry(1, 1, 1, 32, 32, 32),
        new AngularGL.MeshPhongMaterial({
            color: "#29ad33"
        })
    );
    cube.position.y = 0;
    cube.rotation.y = 0.1

    //Sphere 1
    var sphere01 = new AngularGL.Mesh(
        new AngularGL.SphereGeometry(0.5, 32, 32),
        new AngularGL.MeshPhongMaterial({
            color: "#29ad33"
        })
    );
    sphere01.position.x = -0.75;
    
    //Sphere 2
    var sphere02 = new AngularGL.Mesh(
        new AngularGL.SphereGeometry(0.5, 32, 32),
        new AngularGL.MeshPhongMaterial({
            color: 0x8888ff
        })
    );
    sphere02.position.x = 0.75;

    //Floor
    var floor = new AngularGL.Mesh(
        new AngularGL.PlaneGeometry(10, 10),
        new AngularGL.MeshBasicMaterial({
            color: "silver",
            side: THREE.DoubleSide
        })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;

    //Camera
    var camera = new AngularGL.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 3;
    camera.position.y = 0.75;

    //Light
    var light = new AngularGL.PointLight(0xffffff);
    light.position.set(5, 5, 5);

    //Add objects and run scene
    scene.add(sphere01, sphere02, floor, camera, light);
    scene.run();

    //Animation
    var animation = new AngularGL.Animation(scene, function() {
        cube.rotation.y += 2 * Math.PI / 100; //approx 360° (2pi rad) in 5" (100f @20fps)
    });

    //Toggle animation
    $scope.$watch("play", function(p) {
        animation.toggle(p);
    });
    
    //TODO:
    //- higher-level wrappers for Plane, Cube, Sphere, etc.
    //- scene.add to take arrays of objects

}])
.controller("ThreeJsCtrl", [function() {
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