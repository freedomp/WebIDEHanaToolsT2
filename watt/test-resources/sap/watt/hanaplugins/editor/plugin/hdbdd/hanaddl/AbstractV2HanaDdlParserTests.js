// based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests
define(["./GrammarVersionDependentTests",

    "hanaddl/hanav1/CdsDdlParserResolver",
    "hanaddl/hanav2/CdsDdlParserResolver",
    "hanaddl/hanav3/CdsDdlParserResolver",
    "hanaddl/hanav4/CdsDdlParserResolver",
    "hanaddl/hanav5/CdsDdlParserResolver"

], function (GrammarVersionDependentTests) {

    function AbstractV2HanaDdlParserTests(testName) {
    }

    AbstractV2HanaDdlParserTests.prototype = Object.create(GrammarVersionDependentTests.prototype);

    AbstractV2HanaDdlParserTests.prototype.parserVersions = function () {
        return GrammarVersionDependentTests.allParserVersionsAsParameters(GrammarVersionDependentTests.versionFactory.version2);
    };

    // TODO: remove
    AbstractV2HanaDdlParserTests.parserVersions = function () {
        return GrammarVersionDependentTests.allParserVersionsAsParameters(GrammarVersionDependentTests.versionFactory.version2);
    };

    return AbstractV2HanaDdlParserTests;
});
