"use strict";

angular.module("AngularGLApp.controllers", ["AngularGL"])
.controller("MainCtrl", ["$http", "$scope", "$timeout", "AngularGL", function($http, $scope, $timeout, AngularGL) {
    
    //0. Declare objects
    
    //0.1 Cubes
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
            {position: [-1.0, -1.0,  1.0], color: [0.92, 0.57, 0.22]}, //A vertex
            {position: [ 1.0, -1.0,  1.0], color: [0.92, 0.57, 0.22]},
            {position: [ 1.0,  1.0,  1.0], color: [0.92, 0.57, 0.22]},
            {position: [-1.0,  1.0,  1.0], color: [0.92, 1.07, 0.22]}
        ], [ //Back face
            {position: [-1.0, -1.0, -1.0], color: [1, 0, 0]},
            {position: [-1.0,  1.0, -1.0], color: [1, 0, 0]},
            {position: [ 1.0,  1.0, -1.0], color: [1, 0, 0]},
            {position: [ 1.0, -1.0, -1.0], color: [1, 0, 0]}
        ], [ //Top face
            {position: [-1.0,  1.0, -1.0], color: [0, 0, 1]},
            {position: [-1.0,  1.0,  1.0], color: [0, 0, 1]},
            {position: [ 1.0,  1.0,  1.0], color: [0, 0, 1]},
            {position: [ 1.0,  1.0, -1.0], color: [0, 0, 1]}
        ], [ //Bottom face
            {position: [-1.0, -1.0, -1.0], color: [0, 1, 1]},
            {position: [ 1.0, -1.0, -1.0], color: [0, 1, 1]},
            {position: [ 1.0, -1.0,  1.0], color: [0, 1, 1]},
            {position: [-1.0, -1.0,  1.0], color: [0, 1, 1]}
        ], [ //Right face
            {position: [1.0, -1.0, -1.0], color: [0, 1, 0]},
            {position: [1.0,  1.0, -1.0], color: [0, 1, 0]},
            {position: [1.0,  1.0,  1.0], color: [0, 1, 0]},
            {position: [1.0, -1.0,  1.0], color: [0, 1, 0]}
        ], [ //Left face
            {position: [-1.0, -1.0, -1.0], color: [1, 0, 1]},
            {position: [-1.0, -1.0,  1.0], color: [1, 0, 1]},
            {position: [-1.0,  1.0,  1.0], color: [1, 0, 1]},
            {position: [-1.0,  1.0, -1.0], color: [1, 0, 1]}
        ]
    ])
        .setElementArray(elementArray)
        .setColor([0.8, 0.8, 1]);
        //.setTexture("js/libs/angulargl/textures/bricks1.png"); //TODO
    var cubeNoElementArray = new AngularGL.Solid([ //Another cube, but no element array
        [ //Front face
            {position: [-0.5, -0.5, 0.5]},
            {position: [ 0.5, -0.5, 0.5]},
            {position: [-0.5,  0.5, 0.5]},
            {position: [ 0.5,  0.5, 0.5]}
        ], [ //Back face
            {position: [-0.5, -0.5, -0.5]},
            {position: [ 0.5, -0.5, -0.5]},
            {position: [-0.5,  0.5, -0.5]},
            {position: [ 0.5,  0.5, -0.5]}
        ], [ //Top face
            {position: [-0.5, 0.5,  0.5]},
            {position: [ 0.5, 0.5,  0.5]},
            {position: [-0.5, 0.5, -0.5]},
            {position: [ 0.5, 0.5, -0.5]}
        ], [ //Bottom face
            {position: [-0.5, -0.5,  0.5]},
            {position: [ 0.5, -0.5,  0.5]},
            {position: [-0.5, -0.5, -0.5]},
            {position: [ 0.5, -0.5, -0.5]}
        ], [ //Right face
            {position: [0.5, -0.5,  0.5]},
            {position: [0.5, -0.5, -0.5]},
            {position: [0.5,  0.5,  0.5]},
            {position: [0.5,  0.5, -0.5]}
        ], [ //Left face
            {position: [-0.5, -0.5,  0.5]},
            {position: [-0.5, -0.5, -0.5]},
            {position: [-0.5,  0.5,  0.5]},
            {position: [-0.5,  0.5, -0.5]}
        ]
    ])
        .setColor([0.8, 0.8, 1]);
        //.setTexture("js/libs/webgl/textures/bricks2.png"); //TODO
   
    //0.2 Squares
    var squares = [
        new AngularGL.Shape([ //A square
            {position: [-0.5, -0.5]},
            {position: [ 0.5, -0.5]},
            {position: [-0.5,  0.5]},
            {position: [ 0.5,  0.5]}
        ]).setColor([1, 0, 0]),
        new AngularGL.Shape([ //Same square, translated-x by 1
            {position: [0.5, -0.5]},
            {position: [1.5, -0.5]},
            {position: [0.5,  0.5]},
            {position: [1.5,  0.5]}
        ]).setColor([1, 0, 0]),
        new AngularGL.Shape([ //Same square, translated-y by 1
            {position: [-0.5, 0.5]},
            {position: [ 0.5, 0.5]},
            {position: [-0.5, 1.5]},
            {position: [ 0.5, 1.5]}
        ]).setColor([1, 0, 0]),
        new AngularGL.Shape([ //Same square, translated-z by 1
            {position: [-0.5, -0.5, 1.0]},
            {position: [ 0.5, -0.5, 1.0]},
            {position: [-0.5,  0.5, 1.0]},
            {position: [ 0.5,  0.5, 1.0]}
        ]).setColor([1, 0, 0])
    ];
    
    //0.3 triangles
    var triangles = [
        new AngularGL.Shape([ //A triangle
            {position: [-0.5, -0.5, 1], color: [0.5, 0, 0]},
            {position: [0.5, -0.5, 1], color: [0.5, 0, 0]},
            {position: [0, 0.5, 1], color: [0.5, 0, 0]}
        ]),
        new AngularGL.Shape([ //Another triangle
            {position: [1, -1.0], color: [0, 0, 1.0]},
            {position: [2, -1.0], color: [0, 0, 1.0]},
            {position: [1.5, 1.0], color: [0, 0, 1.0]}
        ]).setTexture("js/libs/angulargl/textures/bricks2.png", 10)
    ];
    var triangle = triangles[0].setColor([0.8, 0.8, 1]);
    
    //0.4 floor
    var floor = new AngularGL.Shape([
        {position: [-1, -0.5,  1]},
        {position: [ 1, -0.5,  1]},
        {position: [-1, -0.5, -1]},
        {position: [ 1, -0.5, -1]}
    ])
        .setColor([1, 1, 1]);
        //.setTexture("js/libs/angulargl/textures/bricks2.png", 20);
    
    //1. Declare canvas
    var canvas = new AngularGL.Canvas("canvas", {
        ambientColor: "#000000",
        lightColor: "#ffffff",
        lightDirection: [0, -1, 0]
    }, $scope);
    //canvas.addObjects(floor);
    canvas.addObjects(cubeNoElementArray);
    //canvas.addObjects(squares[0]);
    //canvas.addObjects(triangle);

    //2. Add shaders
    canvas.addShaders({
        path: "js/libs/angulargl/shaders/",
        fragmentShader: "fragmentMixed.c",
        vertexShader: "vertex.c"
    });

    //3. Attach event listeners
    canvas.on({
        keydown: function(e) {
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
        },
        mousewheel: function(e) {
            if(e.wheelDelta >= 0) {
                $scope.z++;
            } else {
                $scope.z--;
            }
        }
    });

    //4. Animation
    (function() {
        //Define an animation function (a function that modifies and returns the model)
        //TODO: don't pass whole scope but only object (model) containgin required properties
        var animateFn = function() {
            //Update scope
            $scope.ry = ($scope.ry - 1) % 360; //degrees
            return $scope;
        };

        //Toggle animate
        $scope.$watch("play", function(p) {
            canvas.isAnimating = p;
            if(p) {
                //TODO: use async.forever or something...
                async.whilst(function() {
                    return $scope.play;
                }, function(cb) {
                    canvas.animate(animateFn, cb);
                }, _.noop);
            }
        });

        //Render each time $scope is changed by user events
        $scope.$watch("x+y+z+rx+ry+rz", function() {
            canvas.render($scope);
        });
    })();
}]);