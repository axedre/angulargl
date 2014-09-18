var express = require("express");
var http = require("http");
var https = require("https");
var fs = require("fs");
var _ = require("underscore");
var async = require("async");
//Include underscore.string
_.mixin(require("underscore.string").exports());

// configure app
var app = express();
var server = require("http").createServer(app);
app.set("port", process.env.OPENSHIFT_NODEJS_PORT || 4000);
app.use(express.static(__dirname + "/app"));
app.use(express.static(__dirname + "/node_modules/async/lib"));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "TRUE");
    // intercept OPTIONS method
    if (req.method === "OPTIONS") {
        res.send(200);
    } else {
        next();
    }
});
app.enable("trust proxy");
server.listen(app.get("port"), process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1", function() {
    console.log("Server started on port", app.get("port"));
});