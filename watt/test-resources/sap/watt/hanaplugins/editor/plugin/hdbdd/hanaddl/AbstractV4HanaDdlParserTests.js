// based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests
define(["./GrammarVersionDependentTests",

    "hanaddl/hanav1/CdsDdlParserResolver",
    "hanaddl/hanav2/CdsDdlParserResolver",
    "hanaddl/hanav3/CdsDdlParserResolver",
    "hanaddl/hanav4/CdsDdlParserResolver",
    "hanaddl/hanav5/CdsDdlParserResolver"

], function (GrammarVersionDependentTests) {

    function AbstractV4HanaDdlParserTests(testName) {
    }

    AbstractV4HanaDdlParserTests.prototype = Object.create(GrammarVersionDependentTests.prototype);

    AbstractV4HanaDdlParserTests.prototype.parserVersions = function () {
        return GrammarVersionDependentTests.allParserVersionsAsParameters(GrammarVersionDependentTests.versionFactory.version4);
    };

    // TODO: remove
    AbstractV4HanaDdlParserTests.parserVersions = function () {
        return GrammarVersionDependentTests.allParserVersionsAsParameters(GrammarVersionDependentTests.versionFactory.version4);
    };

    return AbstractV4HanaDdlParserTests;
});
