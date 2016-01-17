// based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests
define(["./GrammarVersionDependentTests",

    "hanaddl/hanav1/CdsDdlParserResolver",
    "hanaddl/hanav2/CdsDdlParserResolver",
    "hanaddl/hanav3/CdsDdlParserResolver",
    "hanaddl/hanav4/CdsDdlParserResolver",
    "hanaddl/hanav5/CdsDdlParserResolver"

], function (GrammarVersionDependentTests) {

    function AbstractV1HanaDdlParserTests(testName) {
    }

    AbstractV1HanaDdlParserTests.prototype = Object.create(GrammarVersionDependentTests.prototype);

    AbstractV1HanaDdlParserTests.prototype.parserVersions = function () {
        return GrammarVersionDependentTests.allParserVersionsAsParameters(GrammarVersionDependentTests.versionFactory.version1);
    };

    // TODO: remove
    AbstractV1HanaDdlParserTests.parserVersions = function () {
        return GrammarVersionDependentTests.allParserVersionsAsParameters(GrammarVersionDependentTests.versionFactory.version1);
    };

    return AbstractV1HanaDdlParserTests;
});
