/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
RequirePaths.setRequireJsConfigForHanaDdl(2);
define(
    [
        "hanaddl/hanaddlNonUi",
        "./AbstractV4HanaDdlParserTests",
        "hanaddl/hanav1/CdsDdlParserResolver",
        "hanaddl/hanav2/CdsDdlParserResolver",
        "hanaddl/hanav3/CdsDdlParserResolver",
        "hanaddl/hanav4/CdsDdlParserResolver",
        "hanaddl/hanav5/CdsDdlParserResolver"
    ], //dependencies
    function (hanaddlNonUi, AbstractV1HanaDdlParserTests) {

        test("DdlSourceUtil activation handling", function (assert) {
            var result = hanaddlNonUi.DdlSourceUtil.getNamespace("system-local.package1.package2");
            equal(result, '"system-local"."package1"."package2"');
        });

        QUnit.start();
    }
);