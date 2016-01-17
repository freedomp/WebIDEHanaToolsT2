// based on commit
//6ddcfb9df80c90c7e0ef23adb08027c07a62b0aa CDS: Fix checking if a path is a prefix of another path

RequirePaths.setRequireJsConfigForHanaDdl(2);

define(["hanaddl/hanaddlNonUi"], function (hanaddlNonUi) {

        var CompareUtil = hanaddlNonUi.CompareUtil;

        function TestsUnitCompareUtil() {
        }

        TestsUnitCompareUtil.prototype.a_bIsPrefixOfa_b_c = function () {
            equal(CompareUtil.isPrefixOfPath("a.b.c", "a.b"), true);
        };
        TestsUnitCompareUtil.prototype.a_bIsPrefixOfa_b = function () {
            equal(CompareUtil.isPrefixOfPath("a.b", "a.b"), true);
        };
        TestsUnitCompareUtil.prototype.a_bIsNotPrefixOfa_b1 = function () {
            equal(CompareUtil.isPrefixOfPath("a.b1", "a.b"), false);
        };
        TestsUnitCompareUtil.prototype.a_bIsNotPrefixOfx_y_z = function () {
            equal(CompareUtil.isPrefixOfPath("x.y.z", "a.b"), false);
        };


//TEST METHODS

        test("a_bIsPrefixOfa_b_c", function (assert) {
            var cut = new TestsUnitCompareUtil();
            cut.a_bIsPrefixOfa_b_c();
        });

        test("a_bIsPrefixOfa_b", function (assert) {
            var cut = new TestsUnitCompareUtil();
            cut.a_bIsPrefixOfa_b();
        });

        test("a_bIsNotPrefixOfa_b1", function (assert) {
            var cut = new TestsUnitCompareUtil();
            cut.a_bIsNotPrefixOfa_b1();
        });

        test("a_bIsNotPrefixOfx_y_z", function (assert) {
            var cut = new TestsUnitCompareUtil();
            cut.a_bIsNotPrefixOfx_y_z();
        });

        QUnit.start();
        return TestsUnitCompareUtil;
    }
);