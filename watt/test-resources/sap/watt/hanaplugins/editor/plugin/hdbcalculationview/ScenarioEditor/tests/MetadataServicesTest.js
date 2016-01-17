define(["sap/hana/ide/editor/plugin/analytics/base/MetadataServices"], function(MetadataServices) {

    "use strict";

    QUnit.module("Search Service");

    QUnit.test("Table Search", function(assert) {
        var done = assert.async();
        assert.expect(1);

        var myService = MetadataServices.searchService;
        myService.searchNew("idetests.editor.plugin.analytics.testdata::SALESREVENUE", "PATTERN", 20, false, false, false, function(data, textStatus) {
            var text;
            if (data && data.Severity !== "Error") {
                text = JSON.stringify(data);
                var metadata = data.metadata;
                //assert.strictGreater(metadata.length, 2, "Search result match! Count: " + metadata.length);
                if (metadata.length >= 1 && metadata[0].schema === "WEB_IDE_MODELER") {
                    assert.ok(true, "Search successful! Count: " + metadata.length);
                } else {
                    assert.ok(false, "no data returned");
                }
            } else {
                assert.ok(false, "no data returned");
                text = "";
            }
            var replacer = new RegExp(",", "g");
            var textFormatted = text.replace(replacer, ",<br>");
            done();
        }, function(jqXHR, textStatus) {
            var errorText = JSON.stringify(jqXHR);
            assert.ok(false, "error calling service");
            // strictEqual("Test case called!" + errorText);
            done();
        });
        //strictEqual("SALES", "SALES", "Test case called!");
    });
});