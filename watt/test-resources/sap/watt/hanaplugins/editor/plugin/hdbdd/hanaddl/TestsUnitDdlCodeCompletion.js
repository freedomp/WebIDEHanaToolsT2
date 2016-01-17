RequirePaths.setRequireJsConfigForHanaDdl(2);

require(["hdbdd/codecompletion/DdlCodeCompletionImpl"], function (DdlCodeCompletion) {

    test("getCalculatedPrefix", function (assert) {

        var contentStatusMock = {prefix: "          prefixWithSpaces"};

        var calculatedPrefix = DdlCodeCompletion.getCalculatedPrefix(contentStatusMock);

        equal(calculatedPrefix, "prefixWithSpaces", "prefix does not contain spaces");
    });

    QUnit.start();
});