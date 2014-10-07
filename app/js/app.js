"use strict";

angular.module("AngularGLApp", [
    "ngRoute",
    "AngularGLApp.controllers",
    "ui.bootstrap"
])
.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/", {redirectTo: "/threejs"});//, templateUrl: "partials/view.html", controller: "MainCtrl"});
    $routeProvider.when("/threejs", {templateUrl: "partials/view.html", controller: "ThreeJsCtrl"});
    $routeProvider.otherwise({redirectTo: "/"});
}]);