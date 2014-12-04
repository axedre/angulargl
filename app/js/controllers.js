"use strict";

angular.module("AngularGLApp.controllers", ["AngularGL"])
.controller("RootCtrl", ["$scope", "$location", function($scope, $location) {
    $scope.activePath = null;
    $scope.$on("$routeChangeSuccess", function() {
        $scope.activePath = $location.path().substr(1);
    });
}])
.controller("ReflectionCtrl", ["$scope", "AngularGL", function($scope, AngularGL) {
    //Scene
    var scene = new AngularGL.Scene({
        domElementId: "canvas",
        scope: $scope,
        alpha: false,
        controls: false
    });

    //Axis Helper
    var axisHelper = new AngularGL.AxisHelper(150);
    //scene.add(axisHelper);

    //Primary Camera
    var camera01 = new AngularGL.PerspectiveCamera(45, 1, 1, 10000);
    camera01.position.set(-47.50, 20, 53.20);
    camera01.lookAtOrigin();
    scene.add(camera01);

    //Floor
    var floor = new AngularGL.Plane({xyz: 300, color: "silver"});
    scene.add(floor);

    //Wall
    var wallColor = "#6a6a6a"
    var wall = new AngularGL.Cube({
        sides: [100, 100, 10],
        color: wallColor,
        shininess: 50,
        ambient: 0x444444,
        reflectivity: [0, 0, 0, 0, 1, 0] //TODO
    });
    var wallMirror = new AngularGL.Mirror(scene, {
        width: 100,
        height: 100,
        color: wallColor
    });
    wall.material = new AngularGL.MeshFaceMaterial([
        new AngularGL.MeshPhongMaterial({color: wallColor, side: AngularGL.FrontSide}),
        new AngularGL.MeshPhongMaterial({color: wallColor, side: AngularGL.FrontSide}),
        new AngularGL.MeshPhongMaterial({color: wallColor, side: AngularGL.FrontSide}),
        new AngularGL.MeshPhongMaterial({color: wallColor, side: AngularGL.FrontSide}),
        wallMirror.material,
        new AngularGL.MeshPhongMaterial({color: wallColor, side: AngularGL.FrontSide})
    ]);
    wall.add(wallMirror);
    wall.position.set(0, 50, -15);
    wall.rotation.y += Math.PI / 12; //30° w.r.t. the approaching cube
    scene.add(wall);

    //Cube
    var cube = new AngularGL.Cube({xyz: 8, segments: 24, color: "#29ad33"});
    cube.position.set(0, 4, 1);
    scene.add(cube);

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
        //PointLight
        glass.add(new AngularGL.PointLight(0xffffff, 0.5));
        //SpotLight
        var spotlight = new AngularGL.SpotLight(0xffffff);
        spotlight.shadowDarkness = 0.5;
        spotlight.shadowCameraNear = 1;
        spotlight.shadowCameraFar = 200;
        spotlight.onlyShadow = true;
        spotlight.angle = Math.PI/2;
        spotlight.target = cube;
        glass.add(spotlight);
        post.add(glass);
        post.add(cap);
        posts.push(post);
    }
    scene.add(posts);

    //Skybox
    //scene.add(new AngularGL.SkyBox());

    //Sun
    //scene.add(new AngularGL.Sun());

    //Reset scene
    function resetScene() {
        cube.position.x = 60;
    }
    resetScene();

    //Run scene
    scene.run();
    
    //Animation
    var animation = new AngularGL.Animation(scene, function() {
        if(cube.position.x > -20) {
            //cube.rotation.y += 2 * Math.PI / 100; //approx 360° (2pi rad) in 5" (100f @20fps)
            cube.position.x -= 1;
        } else {
            this.reset();
        }
    }, resetScene);

    //Gui
    scene.gui = "partials/reflectionControls.html";
    //Reflectivity slider
    $scope.r = 0.5;
    $scope.$watch("r", function(r) {
        wallMirror.reflectivity = r;
    });

    //TODO: figure out wht to do with these
    
    //Toggle animation
    //$scope.play = true;
    $scope.$watch("play", function(p) {
        animation.toggle(p);
    });

    //Right controls
    $scope.reset = animation.reset.bind(animation);
    $scope.step = animation.stepOnce.bind(animation);
    $scope.getCameraPosition = function() {
        var pos = $scope.camera.position;
        console.log("%s, %s, %s", pos.x.toFixed(2), pos.y.toFixed(2), pos.z.toFixed(2));
    };

    //Loggare tempi di rendering su vari browser, mappare su grafici.
    //Benchmarking prestazioni
    //Toggling uso CPU/GPU

}])
.controller("DiffractionCtrl", ["$scope", "AngularGL", function($scope, AngularGL) {
    //Scene
    var scene = new AngularGL.Scene({domElementId: "canvas", scope: $scope, alpha: false});

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
    cdFront.material = new AngularGL.MeshBasicMaterial({color: "#1200aa", side: AngularGL.FrontSide});
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
        transparent: false
    });
    cdBack.geometry.applyMatrix(new AngularGL.Matrix4().makeTranslation(0, 0, -AngularGL.EPSILON));
    //Compute tangents
    _.each(cdBack.geometry.vertices, function(vertex, i) {
        var g = new AngularGL.Geometry();
        var A = cdBack.geometry.center().clone();
        var B = vertex.clone();
        g.vertices.push(A, B);
        g.applyMatrix(new AngularGL.Matrix4().makeRotationZ(Math.PI / 2));
        vertex.aTangent = B.normalize();
    });
    cdBack.material = new AngularGL.ShaderMaterial({
        uniforms: AngularGL.UniformsUtils.merge([
            AngularGL.UniformsLib["lights"],
            {
                color : {
                    type: "c",
                    value: $scope.color
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
        vertexShader: AngularGL.load("shaders/vshader.c"),
        fragmentShader: AngularGL.load("shaders/fshader.c"),
        side: AngularGL.BackSide,
        lights: true
    });
    var cd = [cdFront, cdInner, cdBack];
    scene.add(cd);

    //Primary Camera
    var camera = new AngularGL.PerspectiveCamera(45, 1, 0.1, 100000);
    camera.position.set(250, 50, 400);
    scene.add(camera);

    //Light
    var light = new AngularGL.PointLight(0x404040, 0.5);
    light.position.set(0, 0, 300);
    scene.add(light);
    
    //Sun
    //scene.add(new AngularGL.Sun());

    //Gui
    scene.gui = "partials/diffractionControls.html";
    var params = ["d", "r", "C"];
    $scope.$watchGroup(params, function(values) {
        _.each(values, function(value, i) {
            cdBack.material.uniforms[params[i]].value = value;
        });
    });
    $scope.$watch("color", function(color) {
        cdBack.material.uniforms.color.value = new AngularGL.Color(color);
    });
    $scope.color = "#ffe55c";
    $scope.d = 2.0;
    $scope.r = 0.5;
    $scope.C = 4.0;
    
    //Reset scene
    function resetScene() {
        _.each(cd, function(part) {
            if(part) {
                part.rotation.x = Math.PI;
            }
        });
    }
    resetScene();

    //Run scene
    scene.run();
    
    //Animation
    var animation = new AngularGL.Animation(scene, function() {
        _.each(cd, function(part, i) {
            if(part) {
                part.rotation.x = (part.rotation.x + 2 * Math.PI / 100) % (2 * Math.PI); //To prevent rotation value from sky-rocketing
            }
        });
    }, resetScene);

    //Toggle animation
    $scope.$watch("play", function(p) {
        animation.toggle(p);
    });

    //Right controls
    $scope.reset = animation.reset.bind(animation);
    $scope.step = animation.step.bind(animation);

}]);