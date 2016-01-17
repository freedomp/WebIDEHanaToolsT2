// Copyright (c) 2015 SAP SE, All Rights Reserved

/* globals console, process, document: true*/
/*eslint no-process-exit: 0*/
/*eslint no-console: 0*/
var requirejs = require('requirejs');

requirejs.config({
    paths: {
        'rndrt' : 'resources/rndrt',//'../../webapp/resources/lib/rndrt',
        'hanaddl' : 'resources/hanaddl/',//'../../webapp/resources/editor/plugin/hdbdd/hanaddl',
        'commonddl': 'resources/commonddl/',// '../../webapp/resources/editor/plugin/hdbdd/commonddl',
        'converttohdbcds': '.'
    }
});

requirejs(
    [
        "converttohdbcds/converttohdbcds"
    ],
    function (converttohdbcds) {
        "use strict";

        //-------------------------------------------------------------
        function usage() {
            console.log("\nusage: " +  process.argv[1] + "[-h] hdbdd-file-to-read [hdbcds-file-to-write]\n\n" +
                "\tConverts file hdbdd-file-to-read into hdbcds-file-to-write\n" +
                "\tIf hdbcds-file-to-write is ommited, writes to stdout\n\n" +
                "\t-h  this help\n" +
                "");
            process.exit(3);
        }

        //-------------------------------------------------------------
        function displayToConsole(message, text) {
            console.log(message.type, message.id, text );
        }

        //-------------------------------------------------------------
        var args = process.argv.slice(2);
        if (args.length === 0 || args.indexOf('-h') !== -1 || args.length > 2  ) {
            usage();
        }
        var hasErrors = true;

        try {
            var fs = require('fs');
            var source = fs.readFileSync(args[0], 'utf8');

            var converter = new converttohdbcds.Converter(__dirname + "/resources"/*"../../webapp/resources/editor/plugin/hdbdd"*/);

            var result = converter.convert(source);

            hasErrors = converttohdbcds.displayMessages(result.messages, displayToConsole);

            if (args.length === 1) {
                console.log('------------------------------------------------------');
                console.log(result.hdbcdscontent);
            } else {
                fs.writeFileSync(args[1], result.hdbcdscontent);
            }

        } catch(err) {
            console.log('ERROR: '  + err.message);
            process.exit(1);
        }

        process.exit(hasErrors ? 1 : 0);
    }
);

