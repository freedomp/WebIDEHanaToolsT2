hdbdd-to-hdbcds
===============

Convert old .hdbdd sources into HDI .hdbcds sources

It performs the following changes:

- Remove the @Schema and @nokey annotation
- Rewrite @Catalog.index as explicit syntax
- Rewrites @SearchIndex and @SearchIndexes as explicit syntax
- Rewrites @GenerateTableType as explicit syntax
- Rewrites @WithStructuresPrivilegeCheck as explicit syntax

## Installation

  npm install hdbdd-to-hdbcds
  npm install requirejs

## Usage

    //load as regular Node module in synchronous code
    var converttohdbcds = require('hdbdd-to-hdbcds');

    //do assync...
    test_caller(converttohdbcds);

    //the assync function receives the module as parameter
    function test_caller(converttohdbcds) {
        try {
            var args = process.argv.slice(2);

            var fs = require('fs');
            var source = fs.readFileSync(args[0], 'utf8');

            var converter = new converttohdbcds.Converter(); //optionally pass  converttohdbcds.resources_dir

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
    }

    function displayToConsole(message, text) {
        console.log(message.type, message.id, text );
    }

## Tests

See mocha tests in test/ directory

## Contributing

The code re-use several RequireJS modules that are underlying the Web IDE
- rndrt/rnd              A parser engine
- hanaddl/hanaddl        The WebIDE code for the hdbdd/hdbdd files in the HANA version
- commonddl/commonddl    The WebIDE code shared by the CDS editors for the HANA and the ABAP version of the CDS language


## Release History

* 0.0.8 Improve conversion of FULL TEXT INDEX.
* 0.0.7 Improve conversion of FULL TEXT INDEX.
* 0.0.6 Increase timeout so that one can convert larger files.
* 0.0.5 Bug fixes. Do a syntax check prior to AST construction.
* 0.0.4 Updated CDS Grammar. Convert @SearchIndex and @SearchIndexes
* 0.0.3 Updated CDS Grammar. Convert more annotations
* 0.0.2 Exports our home location as regular node module
* 0.0.1 Initial release
