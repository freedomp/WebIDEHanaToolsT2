// Copyright (c) 2015 SAP SE, All Rights Reserved

/**
 * Main module for NodeJS
 */


// Load RequireJS
var requirejs = require('requirejs');

if (undefined === requirejs) {
    throw "Please install RequireJS:  npm install requiresjs";
}

//configure the location of our resources
requirejs.config({
    paths: {
        'rndrt' : __dirname + '/resources/rndrt',
        'hanaddl' : __dirname + '/resources/hanaddl/',
        'commonddl': __dirname + '/resources/commonddl/',
        'converttohdbcds': __dirname
    }
});

// load our requirejs module
var converttohdbcds_rs = requirejs("converttohdbcds/converttohdbcds");

//tell the requirejs world where its resources are
converttohdbcds_rs.resources_dir = __dirname + '/resources';

//exports to the Node.js world
exports.ConvertToHdi = converttohdbcds_rs.ConvertToHdi;
exports.Converter = converttohdbcds_rs.Converter;
exports.Log = converttohdbcds_rs.Log;
exports.displayMessages = converttohdbcds_rs.displayMessages;

//export our home location for interested users
exports.home = __dirname;
//export our resource location just in case
exports.resources_dir = __dirname + '/resources';





