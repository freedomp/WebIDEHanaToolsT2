// based on commit
//6ddcfb9df80c90c7e0ef23adb08027c07a62b0aa CDS: Fix checking if a path is a prefix of another path
/*eslint-disable no-eq-null,eqeqeq*/
define(
    ["commonddl/commonddlNonUi", "rndrt/rnd"], //dependencies
    function (commonddl, rnd) {
        var DataSourceImpl = commonddl.DataSourceImpl;

        function CompareUtil() {
        }
        CompareUtil.startsWithIgnoreQuotesAndCase = function(string,startsWith) {
            string = string.toLowerCase();
            startsWith = startsWith.toLowerCase();
            var a = CompareUtil.removeQuotes(string);
            var b = CompareUtil.removeQuotes(startsWith);
            var res = rnd.Utils.stringStartsWith(a, b);
            return res;
        };
        CompareUtil.equalsIgnoreQuotesAndCase = function(name1,name2) {
            var unquotedName1 = CompareUtil.removeQuotes(name1);
            var unquotedName2 = CompareUtil.removeQuotes(name2);
            if (unquotedName1 == null) {
                return false;
            }
            return rnd.Utils.stringEqualsIgnoreCase(unquotedName1, unquotedName2);
        };
        CompareUtil.removeQuotes = function(name) {
            return DataSourceImpl.removeQuotes(name);
        };
        CompareUtil.isPrefixOfPath = function(path,prefix) {
            var localPath = path;
            /*eslint-disable no-constant-condition*/
            while (true) {
                if (prefix === localPath) {
                    return true;
                }
                var lastDot = localPath.lastIndexOf(".");
                if (lastDot == -1) {
                    break;
                }
                localPath = localPath.substring(0,lastDot);
            }
            return false;
        };
        return CompareUtil;
    }
);