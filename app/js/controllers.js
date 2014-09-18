"use strict";

angular.module("AngularGLApp.controllers", ["AngularGL"])
.controller("MainCtrl", ["$http", "$scope", "$timeout", "AngularGL", function($http, $scope, $timeout, AngularGL) {
    $scope.x = -0.5;
    $scope.y = 0;
    $scope.z = -3;
    $scope.rx = 0;
    $scope.ry = 0;
    $scope.rz = 0;

    var elementArray = [ //Element array
        0,  1,  2,      0,  2,  3,    //Front
        4,  5,  6,      4,  6,  7,    //Back
        8,  9,  10,     8,  10, 11,   //Top
        12, 13, 14,     12, 14, 15,   //Bottom
        16, 17, 18,     16, 18, 19,   //Right
        20, 21, 22,     20, 22, 23    //Left
    ];
    var cubeWithElementArray = new AngularGL.Solid([ //A cube
        [ //Front face
            {position: [-0.5, -0.5,  0.5], color: [0.92, 0.57, 0.22]}, //A vertex
            {position: [ 0.5, -0.5,  0.5], color: [0.92, 0.57, 0.22]},
            {position: [ 0.5,  0.5,  0.5], color: [0.92, 0.57, 0.22]},
            {position: [-0.5,  0.5,  0.5], color: [0.92, 0.57, 0.22]}
        ], [ //Back face
            {position: [-0.5, -0.5, -0.5], color: [1, 0, 0]},
            {position: [-0.5,  0.5, -0.5], color: [1, 0, 0]},
            {position: [ 0.5,  0.5, -0.5], color: [1, 0, 0]},
            {position: [ 0.5, -0.5, -0.5], color: [1, 0, 0]}
        ], [ //Top face
            {position: [-0.5,  0.5, -0.5], color: [0, 0, 1]},
            {position: [-0.5,  0.5,  0.5], color: [0, 0, 1]},
            {position: [ 0.5,  0.5,  0.5], color: [0, 0, 1]},
            {position: [ 0.5,  0.5, -0.5], color: [0, 0, 1]}
        ], [ //Bottom face
            {position: [-0.5, -0.5, -0.5], color: [0, 1, 1]},
            {position: [ 0.5, -0.5, -0.5], color: [0, 1, 1]},
            {position: [ 0.5, -0.5,  0.5], color: [0, 1, 1]},
            {position: [-0.5, -0.5,  0.5], color: [0, 1, 1]}
        ], [ //Right face
            {position: [0.5, -0.5, -0.5], color: [0, 1, 0]},
            {position: [0.5,  0.5, -0.5], color: [0, 1, 0]},
            {position: [0.5,  0.5,  0.5], color: [0, 1, 0]},
            {position: [0.5, -0.5,  0.5], color: [0, 1, 0]}
        ], [ //Left face
            {position: [-0.5, -0.5, -0.5], color: [1, 0, 1]},
            {position: [-0.5, -0.5,  0.5], color: [1, 0, 1]},
            {position: [-0.5,  0.5,  0.5], color: [1, 0, 1]},
            {position: [-0.5,  0.5, -0.5], color: [1, 0, 1]}
        ]
    ], elementArray);//.setColor([1, 1, 1]);
//.setTexture("js/libs/angulargl/textures/bricks1.png");
    /*var cubeNoElemArray = new WebGL.Solid([ //Another cube, but no element array
        [ //Front face
            {position: [0, 0, 1], color: [0.92, 0.57, 0.22]},
            {position: [1, 0, 1], color: [0.92, 0.57, 0.22]},
            {position: [0, 1, 1], color: [0.92, 0.57, 0.22]},
            {position: [1, 1, 1], color: [0.92, 0.57, 0.22]}
        ], [ //Back face
            {position: [0, 0, 0], color: [1, 0, 0]},
            {position: [0, 1, 0], color: [1, 0, 0]},
            {position: [1, 0, 0], color: [1, 0, 0]},
            {position: [1, 1, 0], color: [1, 0, 0]}
        ], [ //Top face
            {position: [0, 1, 0], color: [0, 0, 1]},
            {position: [0, 1, 1], color: [0, 0, 1]},
            {position: [1, 1, 0], color: [0, 0, 1]},
            {position: [1, 1, 1], color: [0, 0, 1]}
        ], [ //Bottom face
            {position: [0, 0, 0], color: [0, 1, 1]},
            {position: [1, 0, 0], color: [0, 1, 1]},
            {position: [0, 0, 1], color: [0, 1, 1]},
            {position: [1, 0, 1], color: [0, 1, 1]}
        ], [ //Right face
            {position: [1, 0, 0], color: [0, 1, 0]},
            {position: [1, 1, 0], color: [0, 1, 0]},
            {position: [1, 0, 1], color: [0, 1, 0]},
            {position: [1, 1, 1], color: [0, 1, 0]}
        ], [ //Left face
            {position: [0, 0, 0], color: [1, 0, 1]},
            {position: [0, 0, 1], color: [1, 0, 1]},
            {position: [0, 1, 0], color: [1, 0, 1]},
            {position: [0, 1, 1], color: [1, 0, 1]}
        ]
    ]).setTexture("js/libs/webgl/textures/bricks2.png");*/
    var square = new AngularGL.Shape([ //A square
        {position: [-0.5, -0.5]},
        {position: [0.5, -0.5]},
        {position: [-0.5, 0.5]},
        {position: [0.5, 0.5]}
    ]).setTexture("js/libs/angulargl/textures/bricks1.png", 10);
    var triangle = [
        new AngularGL.Shape([ //A triangle
            {position: [-0.5, -0.5], color: [0.5, 0, 0]},
            {position: [0.5, -0.5], color: [0.5, 0, 0]},
            {position: [0, 0.5], color: [0.5, 0, 0]}
        ]),
        new AngularGL.Shape([ //Another triangle
            {position: [1, -0.5], color: [0, 0, 0.5]},
            {position: [2, -0.5], color: [0, 0, 0.5]},
            {position: [1.5, 0.5], color: [0, 0, 0.5]}
        ])//.setTexture("js/libs/angulargl/textures/bricks1.png", 10)
    ];

    //1.
    var canvas = new AngularGL.Canvas("canvas", {
        width: 1100,
        height: 800,
        background: [0, 0, 0] //black
    });
    //canvas.addObjects(cubeWithElementArray);
    //canvas.addObjects(square);
    canvas.addObjects(cubeWithElementArray, triangle[1]);

    //2.
    canvas.addShaders({
        path: "js/libs/angulargl/shaders/",
        fragmentShader: "fragmentMixed.c",
        vertexShader: "vertex.c"
    });

    //3.
    //Do stuff
    function tick() {
        //Update
        if($scope.ry >= 0) {
            $scope.inc = -1/2;
        } else if ($scope.ry <= -20) {
            $scope.inc = 1/2;
        }
        $scope.ry += $scope.inc;
        //Render
        canvas.render($scope);
        //Request new frame
        if($scope.play) {
            AngularGL.Utils.requestAnimFrame(tick);
        }
    }
    $scope.$watch("play", function(p) {
        if(p) {
            tick();
        }
    });

    canvas.on({
        "keydown": function(e) {
            $scope.$apply(function() {
                /*
                switch(e.keyCode) {
                    case 37: //Left cursor key
                        $scope.x--;
                        break;
                    case 38: //Up cursor key
                        $scope.y++;
                        break;
                    case 39: //Right cursor key
                        $scope.x++;
                        break;
                    case 40: //Down cursor key
                        $scope.y--;
                        break;
                }
                */
                switch(e.keyCode) {
                    case 37: //Left cursor key
                        $scope.ry--;
                        break;
                    case 38: //Up cursor key
                        $scope.rx--;
                        break;
                    case 39: //Right cursor key
                        $scope.ry++;
                        break;
                    case 40: //Down cursor key
                        $scope.rx++;
                        break;
                }
            });
        },
        "mousewheel": function(e) {
            $scope.$apply(function() {
                if(e.wheelDelta >= 0) {
                    $scope.z++;
                } else {
                    $scope.z--;
                }
            });
        }
    });

    //4. Render each time $scope.z changes
    $scope.$watch("x+y+z+rx+ry+rz", function() {
        if(!$scope.play) {
            canvas.render($scope);
        }
    });
}]);