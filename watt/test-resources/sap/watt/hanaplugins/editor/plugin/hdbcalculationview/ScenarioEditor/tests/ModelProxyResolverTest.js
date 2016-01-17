define([
    "sap/hana/ide/editor/plugin/analytics/viewmodel/ModelProxyResolver",
    'sap/hana/ide/editor/plugin/analytics/viewmodel/model'
], function(ModelProxyResolver, viewmodel) {
    "use strict";

    module("Proxy Resolver");

    test("Resolve", function(assert) {
        expect(1);

        // 1.Create column view model
        var cvModel = new viewmodel.ViewModel(true);
        var columnViewProperties = {
            name: "RR_CV1",
            dataCategory: "CUBE"
        };
        var columnView = cvModel.createColumnView(columnViewProperties);

        // 2. Create Entity in the model
        var attribtues = {
            name: "SALESREVENUE",
            schemaName: "WEB_IDE_MODELER",
            isProxy: "true"
        };
        var entity = cvModel.createEntity(attribtues);

        //3. Resolve the entities
        var resolver = ModelProxyResolver.ProxyResolver;
        resolver.resolve(cvModel, null);
        //assert.strictEqual(metadata.length, 1, "Search result match! Count: " + metadata.length);
        assert.ok(false, "error calling service");
    });
});