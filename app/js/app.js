"use strict";

angular.module("AngularGLApp", [
    "ngRoute",
    "AngularGLApp.controllers",
    "ngMaterial"
])
.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/", {redirectTo: "/reflection"});
    $routeProvider.when("/reflection", {templateUrl: "partials/view.html", controller: "ReflectionCtrl"});
    $routeProvider.when("/diffraction", {templateUrl: "partials/view.html", controller: "DiffractionCtrl"});
    $routeProvider.otherwise({redirectTo: "/"});
}]);