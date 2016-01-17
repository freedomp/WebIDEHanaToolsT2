/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//5af9117da94e3c9db8e54b0324a83ba181d6081d Catch up with backend grammar
RequirePaths.setRequireJsConfigForHanaDdl(2);
define(
    [
        "./AbstractV4HanaDdlParserTests"
    ], //dependencies
    function (
        AbstractV4HanaDdlParserTests
        ) {
        function TestsUnitHanaDdlParserV4DclGrantOnRoleName() {
        }
        TestsUnitHanaDdlParserV4DclGrantOnRoleName.prototype = Object.create(AbstractV4HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV4DclGrantOnRoleName.prototype.roleWithGrantOnRoleAccepted = function() {
            var tokens = this.parseSource("ACCESSPOLICY policyName "//
                + "{ "//
                + "	ROLE roleName{"//
                + "		GRANT ruleName;"//
                + "		};"//
                + "};");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4DclGrantOnRoleName.prototype.roleWithGrantOnRoleIsInAst = function() {
            var cu = this.parseSourceAndGetAst("ACCESSPOLICY policyName "//
                + "{ "//
                + "	ROLE roleName{"//
                + "		GRANT rule.Name;"//
                + "		};"//
                + "};");
            var ap = this.getFirstAccessPolicy(cu);
            var role = this.getFirstRole(ap);
            var includedRole = role.getEntries()[0];
            equal("rule.Name",includedRole.getName().getPathString(false));
        };


//TEST METHODS

        TestsUnitHanaDdlParserV4DclGrantOnRoleName.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV4DclGrantOnRoleName;
    }
);