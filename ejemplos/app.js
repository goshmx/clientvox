/* jshint node:true */

"use strict";

var http = require('http');
var publicFolder = require('node-static');

var file = new publicFolder.Server('./public');

var server = http.createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
});

server.listen(8888);
