define(["./GrammarVersionDependentTests",

    "hanaddl/hanav1/CdsDdlParserResolver",
    "hanaddl/hanav2/CdsDdlParserResolver",
    "hanaddl/hanav3/CdsDdlParserResolver",
    "hanaddl/hanav4/CdsDdlParserResolver",
    "hanaddl/hanav5/CdsDdlParserResolver"

], function (GrammarVersionDependentTests) {

    function AbstractV5HanaDdlParserTests(testName) {
    }

    AbstractV5HanaDdlParserTests.prototype = Object.create(GrammarVersionDependentTests.prototype);

    AbstractV5HanaDdlParserTests.prototype.parserVersions = function () {
        return GrammarVersionDependentTests.allParserVersionsAsParameters(GrammarVersionDependentTests.versionFactory.version5);
    };

    return AbstractV5HanaDdlParserTests;
});
