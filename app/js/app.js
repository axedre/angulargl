"use strict";

angular.module("AngularGLApp", [
    "ngRoute",
    "AngularGLApp.controllers",
    "ui.bootstrap"
])
.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/", {redirectTo: "/prototype02"});//, templateUrl: "partials/view.html", controller: "MainCtrl"});
    $routeProvider.when("/threejs", {templateUrl: "partials/view.html", controller: "ThreeJsCtrl"});
    $routeProvider.when("/prototype01", {templateUrl: "partials/view.html", controller: "Prototype01Ctrl"});
    $routeProvider.when("/prototype02", {templateUrl: "partials/view.html", controller: "Prototype02Ctrl"});
    $routeProvider.when("/prototype03", {templateUrl: "partials/view.html", controller: "Prototype03Ctrl"});
    $routeProvider.when("/threeJsExample", {templateUrl: "partials/view.html", controller: "ThreeJsExampleCtrl"});
    $routeProvider.otherwise({redirectTo: "/"});
}]);