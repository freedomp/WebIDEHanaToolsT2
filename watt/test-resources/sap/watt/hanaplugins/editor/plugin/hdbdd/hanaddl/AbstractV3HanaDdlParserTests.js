// based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests
define(["./GrammarVersionDependentTests",

    "hanaddl/hanav1/CdsDdlParserResolver",
    "hanaddl/hanav2/CdsDdlParserResolver",
    "hanaddl/hanav3/CdsDdlParserResolver",
    "hanaddl/hanav4/CdsDdlParserResolver",
    "hanaddl/hanav5/CdsDdlParserResolver"

], function (GrammarVersionDependentTests) {

    function AbstractV3HanaDdlParserTests(testName) {
    }

    AbstractV3HanaDdlParserTests.prototype = Object.create(GrammarVersionDependentTests.prototype);

    AbstractV3HanaDdlParserTests.prototype.parserVersions = function () {
        return GrammarVersionDependentTests.allParserVersionsAsParameters(GrammarVersionDependentTests.versionFactory.version3);
    };

    // TODO: remove
    AbstractV3HanaDdlParserTests.parserVersions = function () {
        return GrammarVersionDependentTests.allParserVersionsAsParameters(GrammarVersionDependentTests.versionFactory.version3);
    };

    return AbstractV3HanaDdlParserTests;
});
