/*global declareServiceTest, editorTest*/
/*eslint-disable quotes*/
declareServiceTest(function(context) {
    "use strict";

    module("calcvieweditor: Service");

    editorTest("getTitle", context, "projection1.calculationview", function(assert /*, theDocument*/ ) {
        expect(1);

        return context.service.calcvieweditor.getTitle().then(function(title) {
            assert.strictEqual(title, "projection1.calculationview", "getTitle");
        });
    });

    editorTest("undo", context, "scripted1.calculationview", function(assert, theDocument, e) {
        expect(14);

        var expectedValue =
            '/********* Begin Procedure Script ************/\n' +
            'BEGIN\n' +
            '   var_out = select _ID as ID, \"name\", \"likes\", \"changes\" from \"WEB_IDE_MODELER\".\"idetests.editor.plugin.analytics.testdata::Wiki.Page\";\n' +
            'END /********* End Procedure Script ************/';

        return e.params.editor.getUI5Editor().then(function(editor) {
            return Q.all([
                context.service.calcvieweditor.hasUndo(),
                context.service.calcvieweditor.hasRedo(),
                context.service.calcvieweditor.isClean(),
                context.service.calcvieweditor.getCurrentSqlSchema()
            ]).spread(function(hasUndo, hasRedo, isClean, currentSqlSchema) {
                assert.strictEqual(hasUndo, false, "initial hasUndo");
                assert.strictEqual(hasRedo, false, "initial hasRedo");
                assert.strictEqual(isClean, true, "initial isClean");
                assert.strictEqual(currentSqlSchema, "WEB_IDE_MODELER", "initial currentSqlSchema");
                assert.strictEqual(theDocument.isDirty(), false, "initial isDirty");
                assert.strictEqual(editor.getValue(), expectedValue, "initial getUI5Editor.getValue");
            }).then(function() {
                var range = editor.getRange(0, 0, 0, 0);
                editor.replace(range, "/*INS*/");
                return Q.delay(0); // trigger asynchronous processing to give the framework a chance to react on the editor changed event
            }).then(function() {
                return Q.all([
                    context.service.calcvieweditor.hasUndo(),
                    context.service.calcvieweditor.hasRedo(),
                    context.service.calcvieweditor.isClean()
                ]);
            }).spread(function(hasUndo, hasRedo, isClean) {
                assert.strictEqual(hasUndo, true, "after edit hasUndo");
                assert.strictEqual(hasRedo, false, "after edit hasRedo");
                assert.strictEqual(isClean, false, "after edit isClean");
                assert.strictEqual(theDocument.isDirty(), true, "after edit isDirty");
            }).then(function() {
                return context.service.calcvieweditor.undo();
            }).then(function() {
                return Q.all([
                    context.service.calcvieweditor.hasUndo(),
                    context.service.calcvieweditor.hasRedo(),
                    context.service.calcvieweditor.isClean()
                ]);
            }).spread(function(hasUndo, hasRedo, isClean) {
                assert.strictEqual(hasUndo, false, "after undo hasUndo");
                assert.strictEqual(hasRedo, true, "after undo hasRedo");
                assert.strictEqual(isClean, false, "after undo isClean");
                assert.strictEqual(theDocument.isDirty(), true, "after undo isDirty");
            });
        });
    }, "scriptOpened");

});