/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
define(
    [
        "rndrt/rnd"
    ], //dependencies
    function (
        rnd
        ) {
        function DdlSourceUtil() {
        }
        DdlSourceUtil.getNamespace = function(packageName) {
            if (!(DdlSourceUtil.isQuotedNameRequired(packageName))) {
                return packageName;
            }
            var namespaceValue = "\"" + packageName + "\"";
            var segments = packageName.split(".");
            if (segments == null || segments.length == 0) {
                return namespaceValue;
            }
            namespaceValue = "";
            for (var i = 0;i < segments.length;i++) {
                namespaceValue += "\"" + segments[i];
                if (i < segments.length - 1) {
                    namespaceValue += "\".";
                }else{
                    namespaceValue += "\"";
                }
            }
            return namespaceValue;
        };
        DdlSourceUtil.getFileNameWithoutExtension1 = function(fileName) {
            if (fileName != null) {
                var ind = fileName.lastIndexOf(".");
                if (ind > 0) {
                    return fileName.substring(0,ind);
                }
            }
            return fileName;
        };
        DdlSourceUtil.getFileNameWithoutExtension1 = function(file) {
            return DdlSourceUtil.getFileNameWithoutExtension1(file.getName());
        };
        DdlSourceUtil.getContextName1 = function(fileName) {
            if (!(DdlSourceUtil.isQuotedNameRequired(fileName))) {
                return fileName;
            }
            var contextName = "\"" + fileName + "\"";
            var segments = fileName.split("\"");
            if (segments == null || segments.length == 0) {
                return contextName;
            }
            contextName = "";
            for (var i = 0;i < segments.length;i++) {
                contextName += "\"" + segments[i];
                if (i < segments.length - 1) {
                    contextName += "\"\"";
                }else{
                    contextName += "\"";
                }
            }
            return contextName;
        };
        DdlSourceUtil.getContextName1 = function(file) {
            return DdlSourceUtil.getContextName1(DdlSourceUtil.getFileNameWithoutExtension1(file));
        };
        DdlSourceUtil.isQuotedNameRequired = function(name) {
            if (name == null || (name.length === 0)) {
                return false;
            }
            if (rnd.Utils.stringContains(name, "-") || rnd.Utils.stringContains(name, "\"")) {
                return true;
            }
            return false;
        };
        return DdlSourceUtil;
    }
);