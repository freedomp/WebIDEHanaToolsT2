// DOCS: use 'sap/' as the path prefix for dependencies from the 'production' code.
//       note that this will only work if those files (and their dependencies) can be loaded without
//       the whole WebIde running in the background.
define(["sap/watt/core/Validations"], function(Validations) {

    //simple logical unit test, does not require loading the WebIDe
    describe("Unit test example", function() {
        it('works for app', function() {
            var oInput = {
                "requires": {
                    "services": [
                        "command",
                        "shnitzel"
                    ]
                },

                "configures": {
                    "services": {
                        "command:commands": []
                    }
                }
            };

            // DOCS: Testing a simple function as a unit test.
            //       simple IN --> OUT scenario.
            var aIssues = Validations.checkConfiguredServicesWhichAreNotRequiredOrProvided(oInput);
            expect(aIssues.length).to.equal(0);
        });

    });
});
