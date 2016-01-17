/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//5af9117da94e3c9db8e54b0324a83ba181d6081d Catch up with backend grammar
RequirePaths.setRequireJsConfigForHanaDdl(2);
define(
    [
        "./AbstractV4HanaDdlParserTests",
        "rndrt/rnd"
    ], //dependencies
    function (
        AbstractV4HanaDdlParserTests,rnd
        ) {
        var Category = rnd.Category;

        function TestsUnitHanaDdlParserV4Functions() {
        }
        TestsUnitHanaDdlParserV4Functions.prototype = Object.create(AbstractV4HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV4Functions.prototype.current_dateAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { current_date AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.current_dateIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { current_date AS f1 };");
            var func = this.__getFristSelectListEntryAsFuncExpression(cu);
            this.__assertFunctionExpressionWithoutParameter(func,"current_date");
        };
        TestsUnitHanaDdlParserV4Functions.prototype.dayOfWeekAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { DAYOFWEEK(expression) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.dayOfWeekIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { DAYOFWEEK(expression) AS f1 };");
            var func = this.__getFristSelectListEntryAsFuncExpression(cu);
            this.__assertFunctionExpressionWithOneParameter(func,"DAYOFWEEK","expression");
        };
        TestsUnitHanaDdlParserV4Functions.prototype.dayNameAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { DAYNAME(expression) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.dayNameIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { DAYNAME(expression) AS f1 };");
            var func = this.__getFristSelectListEntryAsFuncExpression(cu);
            this.__assertFunctionExpressionWithOneParameter(func,"DAYNAME","expression");
        };
        TestsUnitHanaDdlParserV4Functions.prototype.monthNameAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { MONTHNAME(expression) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.monthNameIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { MONTHNAME(expression) AS f1 };");
            var func = this.__getFristSelectListEntryAsFuncExpression(cu);
            this.__assertFunctionExpressionWithOneParameter(func,"MONTHNAME","expression");
        };
        TestsUnitHanaDdlParserV4Functions.prototype.leftAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { LEFT(expression, expr) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.leftIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { LEFT(expression, expr) AS f1 };");
            var func = this.__getFristSelectListEntryAsFuncExpression(cu);
            this.__assertFunctionExpressionWithTwoParameters(func,"LEFT","expression","expr");
        };
        TestsUnitHanaDdlParserV4Functions.prototype.rightAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { RIGHT(expression, expr) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.rightIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { RIGHT(expression, expr) as f1 };");
            var func = this.__getFristSelectListEntryAsFuncExpression(cu);
            this.__assertFunctionExpressionWithTwoParameters(func,"RIGHT","expression","expr");
        };
        TestsUnitHanaDdlParserV4Functions.prototype.trimSimpleAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { TRIM(expression) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.trimSimpleInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { TRIM(expression) AS f1 };");
            var trimFunction = this.__getFristSelectListEntryAsTrimFunction(cu);
            this.__assertTrimFunction(trimFunction,"TRIM",null,null,null,"expression");
        };
        TestsUnitHanaDdlParserV4Functions.prototype.trimFromAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { TRIM(expression FROM expression) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.trimFromInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { TRIM(Expression FROM expression) AS f1 };");
            var trimFunction = this.__getFristSelectListEntryAsTrimFunction(cu);
            this.__assertTrimFunction(trimFunction,"TRIM",null,"Expression","FROM","expression");
        };
        TestsUnitHanaDdlParserV4Functions.prototype.trimLeadingFromAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { TRIM( LEADING FROM expression ) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.trimTrailingFromAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { TRIM( TRAILING FROM expression ) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
            equal(Category.CAT_KEYWORD,tokens[9].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.trimBothFromAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { TRIM( BOTH FROM expression ) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
            equal(Category.CAT_KEYWORD,tokens[9].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.trimLeadingExressionFromAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { TRIM( LEADING remString FROM expression ) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.trimLeadingExressionFromIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { TRIM( LEADING remString FROM expression ) AS f1 };");
            var trimFunction = this.__getFristSelectListEntryAsTrimFunction(cu);
            this.__assertTrimFunction(trimFunction,"TRIM","LEADING","remString","FROM","expression");
        };
        TestsUnitHanaDdlParserV4Functions.prototype.extractYearAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { EXTRACT( YEAR FROM expression ) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
            equal(Category.CAT_KEYWORD,tokens[9].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.extractCorrrectInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { EXTRACT( YEAR FROM expression ) AS f1 };");
            var extract = this.__getFristSelectListEntryAsExtractFunction(cu);
            this.__assertExtractFunctionWithOneParameter(extract,"EXTRACT","YEAR","FROM","expression");
        };
        TestsUnitHanaDdlParserV4Functions.prototype.extractMonthAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { EXTRACT( MONTH FROM expression ) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
            equal(Category.CAT_KEYWORD,tokens[9].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.extractDayAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { EXTRACT( DAY FROM expression ) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
            equal(Category.CAT_KEYWORD,tokens[9].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.extractHourAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { EXTRACT( HOUR FROM expression ) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
            equal(Category.CAT_KEYWORD,tokens[9].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.extractMinuteAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { EXTRACT( MINUTE FROM expression ) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
            equal(Category.CAT_KEYWORD,tokens[9].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.extractSecondAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { EXTRACT( SECOND FROM expression ) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
            equal(Category.CAT_KEYWORD,tokens[9].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.castToBigIntAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { CAST( expr AS BIGINT ) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
            equal(Category.CAT_KEYWORD,tokens[11].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.castToBigIntIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { CAST( expr AS BIGINT ) AS f1 };");
            var cast = this.__getFristSelectListEntryAsCastExpression(cu);
            this.__assertCastExpression(cast,"expr","BIGINT",null,null);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.castToTinyIntAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { CAST( expr AS TINYINT ) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
            equal(Category.CAT_KEYWORD,tokens[11].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.castToDecimalWithLengthAndDecimalPlacesAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { CAST( expr AS DECIMAL(1, 2+3) ) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
            equal(Category.CAT_KEYWORD,tokens[11].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.castToDecimalWithLengthAndDecimalPlacesIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { CAST( expr AS DECIMAL(1, 2+3) ) AS f1 };");
            var cast = this.__getFristSelectListEntryAsCastExpression(cu);
            this.__assertCastExpression(cast,"expr","DECIMAL","1","2+3");
        };
        TestsUnitHanaDdlParserV4Functions.prototype.castHasStartEndTokenIndexInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { CAST( expr AS DECIMAL(1, 2+3) ) AS f1 };");
            var cast = this.__getFristSelectListEntryAsCastExpression(cu);
            this.assertStartEndTokenIndex(cast,7,19);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.castToDecimalAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { CAST( expr AS DECIMAL ) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
            equal(Category.CAT_KEYWORD,tokens[11].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.castToDecimalInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { CAST( expr AS DECIMAL ) AS f1 };");
            var cast = this.__getFristSelectListEntryAsCastExpression(cu);
            this.__assertCastExpression(cast,"expr","DECIMAL",null,null);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.castToAlphaNumAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { CAST( expr AS ALPHANUM ) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
            equal(Category.CAT_KEYWORD,tokens[11].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.castToCharAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { CAST( expr AS CHAR ) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
            equal(Category.CAT_KEYWORD,tokens[11].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.castToVarCharAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { CAST( expr AS VARCHAR(3+5) ) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
            equal(Category.CAT_KEYWORD,tokens[11].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.castToVarCharInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { CAST( expr AS VARCHAR(3+5) ) AS f1 };");
            var cast = this.__getFristSelectListEntryAsCastExpression(cu);
            this.__assertCastExpression(cast,"expr","VARCHAR","3+5",null);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.sessionUserFunctionAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { session_user AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.sessionUserFunctionInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { session_user AS f1 };");
            var func = this.__getFristSelectListEntryAsFuncExpression(cu);
            equal("session_user",func.getName().m_lexem);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.userDefinedFunctionAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { DAYOFYEAR(a,b,c) };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.userDefinedFunctionIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { DAYOFYEAR(a,b,c) };");
            var func = this.__getFristSelectListEntryAsFuncExpression(cu);
            this.__assertFunctionExpressionWithThreeParameters(func,"DAYOFYEAR","a","b","c");
        };
        TestsUnitHanaDdlParserV4Functions.prototype.userDefinedFunctionhashWithOneParamIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { hash_sha256(a) };");
            var func = this.__getFristSelectListEntryAsFuncExpression(cu);
            this.__assertFunctionExpressionWithOneParameter(func,"hash_sha256","a");
        };
        TestsUnitHanaDdlParserV4Functions.prototype.userDefinedFunctionWithoutParamIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { quarter() };");
            var func = this.__getFristSelectListEntryAsFuncExpression(cu);
            equal("quarter",func.getName().m_lexem);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.__getFristSelectListEntryAsFuncExpression = function(cu) {
            var view = cu.getStatements()[0];
            var entry = view.getSelect().getSelectList().getEntries()[0];
            var func = entry.getExpression();
            return func;
        };
        TestsUnitHanaDdlParserV4Functions.prototype.__getFristSelectListEntryAsCastExpression = function(cu) {
            var view = cu.getStatements()[0];
            var entry = view.getSelect().getSelectList().getEntries()[0];
            var func = entry.getExpression();
            return func;
        };
        TestsUnitHanaDdlParserV4Functions.prototype.__getFristSelectListEntryAsExtractFunction = function(cu) {
            var view = cu.getStatements()[0];
            var entry = view.getSelect().getSelectList().getEntries()[0];
            var func = entry.getExpression();
            return func;
        };
        TestsUnitHanaDdlParserV4Functions.prototype.__getFristSelectListEntryAsTrimFunction = function(cu) {
            var view = cu.getStatements()[0];
            var entry = view.getSelect().getSelectList().getEntries()[0];
            var func = entry.getExpression();
            return func;
        };
        TestsUnitHanaDdlParserV4Functions.prototype.__assertTrimFunction = function(trimFunction, trimToken, trimPosition, removeString, fromToken, fromExpresssion) {
            equal(trimToken,trimFunction.getName().m_lexem);
            if (trimPosition != null) {
                equal(trimPosition,trimFunction.getTrimPosition().m_lexem);
            }else{
                equal(null,trimFunction.getTrimPosition());
            }
            if (removeString != null) {
                equal(removeString,trimFunction.getRemoveString().getShortDescription());
            }else{
                equal(null,trimFunction.getRemoveString());
            }
            if (fromToken != null) {
                equal(fromToken,trimFunction.getFromKeyword().m_lexem);
            }else{
                equal(null,trimFunction.getFromKeyword());
            }
            equal(fromExpresssion,trimFunction.getParameters()[0].getShortDescription());
        };
        TestsUnitHanaDdlParserV4Functions.prototype.__assertExtractFunctionWithOneParameter = function(extract, extractToken, unit, fromToken, fromExpression) {
            equal(extractToken,extract.getName().m_lexem);
            equal(fromToken,extract.getFromKeyword().m_lexem);
            equal(unit,extract.getUnit().m_lexem);
            equal(fromExpression,extract.getParameters()[0].getShortDescription());
        };
        TestsUnitHanaDdlParserV4Functions.prototype.__assertFunctionExpressionWithoutParameter = function(func, funcName) {
            equal(funcName,func.getName().m_lexem);
        };
        TestsUnitHanaDdlParserV4Functions.prototype.__assertFunctionExpressionWithOneParameter = function(func, funcName, parameter) {
            this.__assertFunctionExpressionWithoutParameter(func,funcName);
            equal(parameter,func.getParameters()[0].getShortDescription());
        };
        TestsUnitHanaDdlParserV4Functions.prototype.__assertFunctionExpressionWithTwoParameters = function(func, funcName, parameter1, parameter2) {
            this.__assertFunctionExpressionWithOneParameter(func,funcName,parameter1);
            equal(parameter2,func.getParameters()[1].getShortDescription());
        };
        TestsUnitHanaDdlParserV4Functions.prototype.__assertFunctionExpressionWithThreeParameters = function(func, funcName, parameter1, parameter2, parameter3) {
            this.__assertFunctionExpressionWithTwoParameters(func,funcName,parameter1,parameter2);
            equal(parameter3,func.getParameters()[2].getShortDescription());
        };
        TestsUnitHanaDdlParserV4Functions.prototype.__assertCastExpression = function(cast, valueExpression, type, length, decimals) {
            equal(valueExpression,cast.getValue().getShortDescription());
            equal(type,cast.getTypeName().m_lexem);
            if (length != null) {
                equal(length,cast.getLengthExpression().getShortDescription());
            }else{
                equal(null,cast.getLengthExpression());
            }
            if (decimals != null) {
                equal(decimals,cast.getDecimalsExpression().getShortDescription());
            }else{
                equal(null,cast.getDecimalsExpression());
            }
        };


//TEST METHODS

        TestsUnitHanaDdlParserV4Functions.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV4Functions;
    }
);