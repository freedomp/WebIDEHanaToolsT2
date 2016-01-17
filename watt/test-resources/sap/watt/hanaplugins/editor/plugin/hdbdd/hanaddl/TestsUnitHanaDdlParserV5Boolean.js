/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
RequirePaths.setRequireJsConfigForHanaDdl(2);

define(
    [
        "rndrt/rnd",
        "./AbstractV5HanaDdlParserTests"
    ], //dependencies
    function (
        rnd,
        AbstractV5HanaDdlParserTests
        ) {
        var Category = rnd.Category;
        var Token = rnd.Token;
        function TestsUnitHanaDdlParserV5Boolean() {
        }
        TestsUnitHanaDdlParserV5Boolean.prototype = Object.create(AbstractV5HanaDdlParserTests.prototype);

        TestsUnitHanaDdlParserV5Boolean.prototype.noTimeout = function() {
            var source = "namespace smw;\r\n"
                + "\r\n"
                + "context esh {\r\n"
                + "\r\n"
                + "@Catalog.tableType: #COLUMN\r\n"
                + "entity AllTypesTable {\r\n"
                + "key \"Tinyint\":        hana.TINYINT;\r\n"
                + "    \"Smallint\":       hana.SMALLINT;\r\n"
                + "    \"integer\":        Integer;\r\n"
                + "    \"Bigint\":         Integer64;\r\n"
                + "    \"Real\":           hana.REAL;\r\n"
                + "    \"Double\":         BinaryFloat;\r\n"
                + "    \"Decimal\":        DecimalFloat;\r\n"
                + "    \"Smalldecimal\":   hana.SMALLDECIMAL;\r\n"
                + "    \"Varchar\":        hana.VARCHAR(100);\r\n"
                + "    @SearchIndex.text : {enabled:true, async:false}\r\n"
                + "    \"NVarchar\":       String(100);\r\n"
                + "    \"Alphanum\":       hana.ALPHANUM(127);\r\n"
                + "    @SearchIndex.text : {enabled:true, async:false}\r\n"
                + "    \"Shorttext\":      String(100);\r\n"
                + "    @SearchIndex.text : {enabled:true, async:false}\r\n"
                + "    \"CLob\":           hana.CLOB;\r\n"
                + "    @SearchIndex.text : {enabled:true, async:false}\r\n"
                + "    \"NCLob\":          LargeString;\r\n"
                + "    @SearchIndex.text : {enabled:true, async:false, textAnalysis : {mode : #SIMPLE }} // FAST PREPROCESS OFF TEXT ANALYSIS OFF\r\n"
                + "    \"BLob\":           LargeBinary;\r\n"
                + "    @SearchIndex.text : {enabled:true, async:false, textAnalysis : {mode : #SIMPLE }} // FAST PREPROCESS OFF TEXT ANALYSIS OFF\r\n"
                + "    \"Varbinary\":      Binary(5000);\r\n" + "    \"Date\":           LocalDate;\r\n"
                + "    \"Time\":           LocalTime;\r\n" + "    \"Timestamp\":      UTCTimestamp;\r\n"
                + "    \"Seconddate\":     UTCDateTime;\r\n" + "    @SearchIndex.text : {enabled:true, async:false}\r\n"
                + "    \"Text\":           LargeString;\r\n" + "\r\n" + "};\r\n" + "\r\n" + "\r\n" + "\r\n"
                + "  @Search.searchable:true\r\n" + "  define view AllSqlTypesAllKeysView as select from AllTypesTable\r\n" + "  {\r\n"
                + "    @Search.defaultSearchElement:true\r\n" + "    @EnterpriseSearch.usageMode : [#AUTO_FACET]\r\n" + "    Tinyint,\r\n"
                + "\r\n" + "    @Search.defaultSearchElement:true\r\n" + "    @EnterpriseSearch.usageMode : [#AUTO_FACET]\r\n"
                + "    Smallint,\r\n" + "\r\n" + "    @Search.defaultSearchElement:true\r\n"
                + "    @EnterpriseSearch.usageMode : [#AUTO_FACET]\r\n" + "    integer,\r\n" + "\r\n"
                + "    @Search.defaultSearchElement:true\r\n" + "    @EnterpriseSearch.usageMode : [#AUTO_FACET]\r\n" + "    Bigint,\r\n"
                + "\r\n" + "    @EnterpriseSearch.key : true\r\n" + "    @Search.defaultSearchElement:true\r\n"
                + "    //@EnterpriseSearch.usageMode : [#AUTO_FACET] no facet on anchor\r\n" + "    Real,\r\n" + "\r\n"
                + "    @Search.defaultSearchElement:true\r\n" + "    @EnterpriseSearch.usageMode : [#AUTO_FACET]\r\n" + "    Double,\r\n"
                + "\r\n" + "    @Search.defaultSearchElement:true\r\n" + "    @EnterpriseSearch.usageMode : [#AUTO_FACET]\r\n"
                + "    Decimal,\r\n" + "\r\n" + "    @Search.defaultSearchElement:true\r\n"
                + "    @EnterpriseSearch.usageMode : [#AUTO_FACET]\r\n" + "    Smalldecimal,\r\n" + "\r\n"
                + "    @Search.defaultSearchElement:true\r\n" + "    @EnterpriseSearch.usageMode : [#AUTO_FACET]\r\n" + "    Varchar,\r\n"
                + "\r\n" + "    @Search.defaultSearchElement:true\r\n" + "    @EnterpriseSearch.usageMode : [#AUTO_FACET]\r\n"
                + "    NVarchar,\r\n" + "\r\n" + "    @Search.defaultSearchElement:true\r\n"
                + "    @EnterpriseSearch.usageMode : [#AUTO_FACET]\r\n" + "    Alphanum,\r\n" + "\r\n"
                + "    @Search.defaultSearchElement:true\r\n" + "    @EnterpriseSearch.usageMode : [#AUTO_FACET]\r\n"
                + "    Shorttext,\r\n" + "\r\n" + "    //annotations are commented out because otherwise\r\n"
                + "    //the cds activation fails\r\n" + "\r\n" + "    //@EnterpriseSearch.key : true\r\n"
                + "    @Search.defaultSearchElement:true\r\n" + "    //@EnterpriseSearch.usageMode : [#AUTO_FACET]\r\n" + "    CLob,\r\n"
                + "\r\n" + "    //@EnterpriseSearch.key : true\r\n" + "    @Search.defaultSearchElement:true\r\n"
                + "    //@EnterpriseSearch.usageMode : [#AUTO_FACET]\r\n" + "    NCLob,\r\n" + "\r\n"
                + "    //@EnterpriseSearch.key : true\r\n" + "    @Search.defaultSearchElement:true\r\n"
                + "    //@EnterpriseSearch.usageMode : [#AUTO_FACET]\r\n" + "    BLob,\r\n" + "\r\n"
                + "    @EnterpriseSearch.key : true\r\n" + "    //@Search.defaultSearchElement:true\r\n"
                + "    @EnterpriseSearch.usageMode : [#AUTO_FACET]\r\n" + "    Varbinary,\r\n" + "\r\n"
                + "    @EnterpriseSearch.key : true\r\n" + "    @Search.defaultSearchElement:true\r\n"
                + "    @EnterpriseSearch.usageMode : [#AUTO_FACET]\r\n" + "    Date,   \r\n" + "\r\n"
                + "    @EnterpriseSearch.key : true\r\n" + "    @Search.defaultSearchElement:true\r\n"
                + "    @EnterpriseSearch.usageMode : [#AUTO_FACET]\r\n" + "    Time\r\n" + "    \r\n" + "  };\r\n" + "\r\n" + "};";
            try {
                var parser = this.getParser();
                parser.setThrowExceptionAtTimeout(true);
                var tokens = parser.parseSource(this.getPadFileResolver(), source);
                this.assertNoErrorTokens(tokens);
            }
            catch(e) {
                console.log(e.stack);
                this.fail(e.stack);
            }
        };
        TestsUnitHanaDdlParserV5Boolean.prototype.nullLiteral = function() {
            var tokens = this.parseSource("ENTITY en { el : Integer = NULL; };");
            this.assertNoErrorTokens(tokens);
            var nullToken = this.__getToken(tokens, "NULL");
            equal("NULL",nullToken.m_lexem);
            equal(Category.CAT_STRICT_KEYWORD,nullToken.m_category);
        };
        TestsUnitHanaDdlParserV5Boolean.prototype.unknownAsNullLiteral = function() {
            var tokens = this.parseSource("ENTITY en { el : Integer = UNKNOWN; };");
            this.assertNoErrorTokens(tokens);
            var unknownToken = this.__getToken(tokens, "UNKNOWN");
            equal("UNKNOWN",unknownToken.m_lexem);
            equal(Category.CAT_STRICT_KEYWORD,unknownToken.m_category);
        };
        TestsUnitHanaDdlParserV5Boolean.prototype.trueAsBooleanLiteral = function() {
            var tokens = this.parseSource("ENTITY en { el : Boolean = TRUE; };");
            this.assertNoErrorTokens(tokens);
            var trueToken = this.__getToken(tokens, "TRUE");
            equal("TRUE",trueToken.m_lexem);
            equal(Category.CAT_STRICT_KEYWORD,trueToken.m_category);
        };
        TestsUnitHanaDdlParserV5Boolean.prototype.falseAsBooleanLiteral = function() {
            var tokens = this.parseSource("ENTITY en { el : Boolean = FALSE; };");
            this.assertNoErrorTokens(tokens);
            var falseToken = this.__getToken(tokens, "FALSE");
            equal("FALSE",falseToken.m_lexem);
            equal(Category.CAT_STRICT_KEYWORD,falseToken.m_category);
        };
        TestsUnitHanaDdlParserV5Boolean.prototype.to_booleanUserDefinedFunction = function() {
            var tokens = this.parseSource("ENTITY en { el : Boolean = TO_BOOLEAN( haha ); };");
            this.assertNoErrorTokens(tokens);
            var token = this.__getToken(tokens, "TO_BOOLEAN");
            equal("TO_BOOLEAN",token.m_lexem);
            equal(Category.CAT_KEYWORD,token.m_category);
        };
        TestsUnitHanaDdlParserV5Boolean.prototype.booleanAsCastType = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { CAST( expr AS BOOLEAN ) AS f1 };");
            this.assertNoErrorTokens(tokens);
            var token = this.__getToken(tokens, "BOOLEAN");
            equal("BOOLEAN",token.m_lexem);
            equal(Category.CAT_KEYWORD,token.m_category);
        };
        TestsUnitHanaDdlParserV5Boolean.prototype.__getToken = function(tokens,lexem) {
            for (var tokenCount = 0;tokenCount < tokens.length;tokenCount++) {
                var token = tokens[tokenCount];
                if (lexem === token.m_lexem) {
                    return token;
                }
            }
            return null;
        };


//TEST METHODS

        TestsUnitHanaDdlParserV5Boolean.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV5Boolean;
    }
);