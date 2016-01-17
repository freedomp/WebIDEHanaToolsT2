function editorTest(testName, context, documentName, onOpened, eventName) {
    var theDocument, calcviewOpened, documentPath;

    documentPath = "/idetests/editor/plugin/analytics/testdata/" + documentName;
    eventName = eventName || "opened";
    
    function startQUnit() {
        Q.delay(200).then(function() {
            QUnit.start();
        }).done();
    }

    function calcviewClosed() {
        context.service.calcvieweditor.detachEvent("closed", calcviewClosed);
        theDocument = null;
        startQUnit();
    }

    function cleanup() {
        context.service.calcvieweditor.detachEvent(eventName, calcviewOpened);
        if (theDocument) {
            // prevent data loss popup
            theDocument._setState({
                bDirty: false
            });
            context.service.calcvieweditor.attachEvent("closed", calcviewClosed);
            Q.delay(500).then(function() {
                return context.service.content.close(theDocument);
            }).done();
        } else {
            startQUnit();
        }
    }

    QUnit.asyncTest(testName, function(assert) {
        calcviewOpened = function(e) {
            onOpened(assert, theDocument, e)
                .fin(cleanup)
                .done();
        };

        context.service.document.getDocumentByPath(documentPath)
            .then(function(doc) {
                theDocument = doc;
                context.service.calcvieweditor.attachEvent(eventName, calcviewOpened);
                return context.service.content.open(doc, context.service.calcvieweditor);
            })
            .fail(cleanup)
            .done();
    });
}