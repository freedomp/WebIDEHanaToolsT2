/*global declareServiceTest*/
/*eslint-disable quotes*/
declareServiceTest(function(context) {
    "use strict";

    function startQUnit() {
        return Q.delay(200).then(function() {
            QUnit.start();
        });
    }

    module("calcvieweditor: RunCommand");

    QUnit.asyncTest("execute", function(assert) {
        expect(1);

        var theDocument, calcviewOpened, sqlOpened;

        function calcviewClosed() {
            context.service.calcvieweditor.detachEvent("closed", calcviewClosed);
            startQUnit();
        }

        function cleanup() {
            context.service.calcvieweditor.detachEvent("opened", calcviewOpened);
            context.service.dataprevieweditor.detachEvent("opened", sqlOpened);
            if (theDocument) {
                context.service.calcvieweditor.attachEvent("closed", calcviewClosed);
                return Q.delay(500).then(function() {
                    return context.service.content.closeAll();
                });
            } else {
                startQUnit();
            }
        }

        calcviewOpened = function() {
            Q.delay(200).then(function() {
                return context.service.focus.setFocus(context.service.calcvieweditor);
            })
                .then(function() {
                    return context.service.command.getCommand("calcvieweditor.run");
                })
                .then(function(command) {
                    context.service.dataprevieweditor.attachEvent("opened", sqlOpened);
                    return Q.delay(200).then(function() {
                        return command.execute();
                    });
                })
                .fail(cleanup)
                .done();
        };

        sqlOpened = function(event) {
            var expectedName = "idetests.editor.plugin.analytics.testdata/scripted1.datapreview";
            var doc = event.params.document;
            assert.strictEqual(doc.getEntity().getName(), expectedName, "SQL document name");
            Q.delay(200).fin(cleanup).done();
            // Q.delay(200).then(function() {
            //     return doc.getContent();
            // })
            //     .then(function(content) {
            //         var expectedContent =
            //             'SELECT TOP 1000\n' +
            //             '	"name",\n' +
            //             '	COUNT("ID") AS "ID",\n' +
            //             '	SUM("likes") AS "likes",\n' +
            //             '	SUM("changes") AS "changes"\n' +
            //             'FROM "_SYS_BIC"."idetests.editor.plugin.analytics.testdata/scripted1"\n' +
            //             'GROUP BY "name";';
            //         assert.strictEqual(content, expectedContent, "SQL document content");
            //     })
            //     .fin(cleanup)
            //     .done();
        };

        context.service.document.getDocumentByPath("/idetests/editor/plugin/analytics/testdata/scripted1.calculationview")
            .then(function(doc) {
                theDocument = doc;
                context.service.calcvieweditor.attachEvent("opened", calcviewOpened);
                return context.service.content.open(doc, context.service.calcvieweditor);
            })
            .fail(cleanup)
            .done();

    });
});