"use strict";

angular.module("AngularGLApp", [
    "ngRoute",
    "AngularGLApp.controllers",
    "ui.bootstrap"
])
.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/", {templateUrl: "partials/view.html", controller: "MainCtrl"});
    $routeProvider.otherwise({redirectTo: "/"});
}]);