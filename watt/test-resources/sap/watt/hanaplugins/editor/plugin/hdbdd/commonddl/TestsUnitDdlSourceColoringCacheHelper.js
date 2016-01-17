/* Functionality which is being tested is independent from ABAP or HANA. 
 * This test has dependency to ABAP as it allows to reuse this test in ABAP repository. */
RequirePaths.setRequireJsConfigForHanaDdl(2);

require(
        [
            "rndrt/rnd", "commonddl/commonddlNonUi", "hanaddl/hanaddlNonUi", "hanaddl/hanav5/CdsDdlParserResolver"
        ],
        function (rnd, commonddlNonUi, hanaddlNonUi) {
            var version = hanaddlNonUi.VersionsFactory.versionLast;
            var parser = new hanaddlNonUi.DdlParserFactoryRespectingBackendVersion().createParser(version);
            
            function getTokensForSource(source) {
                var padFilePath = hanaddlNonUi.CdsDdlPadFileResolver.getPadFilePath();
                var resolver = new hanaddlNonUi.DdlParserFactoryRespectingBackendVersion().createResolver(version, padFilePath);
                var tokens = parser.parseSource(resolver,source);
                return tokens;
            }
            
            test("no comments", function (assert) {
                var buf = new rnd.StringBuffer();
                buf.append("view ez_case_test as select from sflight\r\n");
                buf.append("left outer join saplane on sflight.planetype = saplane.planetype\r\n");
                buf.append("{ \r\n");
                buf.append("     sflight.connid as connections, \r\n");
                buf.append("     sflight.fldate,\r\n");
                buf.append("     count(distinct saplane.producer) as abc");
                var source = buf.toString();
                var tokens = getTokensForSource(source);
                
                var tokensByLine = new commonddlNonUi.DdlSourceColoringCacheHelper().convertTokensToLineCache(tokens);
                
                assert.equal(6, Object.keys(tokensByLine).length, "Number of lines in cache" );
            });
            
            test("single line comment", function (assert) {
                var buf = new rnd.StringBuffer();
                buf.append("view ez_case_test as select from sflight\r\n");
                buf.append("left outer join saplane on sflight.planetype = saplane.planetype\r\n");
                buf.append("{ \r\n");
                buf.append("     sflight.connid //as connections, \r\n");
                buf.append("     sflight.fldate,\r\n");
                buf.append("     count(distinct saplane.producer) as abc");
                var source = buf.toString();
                var tokens = getTokensForSource(source);
                
                var tokensByLine = new commonddlNonUi.DdlSourceColoringCacheHelper().convertTokensToLineCache(tokens);
                
                assert.equal(6, Object.keys(tokensByLine).length, "Number of lines in cache" );
                assert.equal(4, tokensByLine[3].length, "Number of tokens in a single comment line");
                var rndTokens = tokensByLine[3];
                assert.equal(rndTokens[3].m_category.value, rnd.Category.CAT_COMMENT.value, "token is a comment");
            });
            
            test("block comment in one line", function (assert) {
                var buf = new rnd.StringBuffer();
                buf.append("view ez_case_test as select from sflight\r\n");
                buf.append("left outer join saplane on sflight.planetype = saplane.planetype\r\n");
                buf.append("{ \r\n");
                buf.append("     /*sflight.connid as connections,*/\r\n");
                buf.append("     sflight.fldate,\r\n");
                buf.append("     count(distinct saplane.producer) as abc");
                var source = buf.toString();
                var tokens = getTokensForSource(source);
                
                var tokensByLine = new commonddlNonUi.DdlSourceColoringCacheHelper().convertTokensToLineCache(tokens);
                
                assert.equal(6, Object.keys(tokensByLine).length, "Number of lines in cache" );
                assert.equal(1, tokensByLine[3].length, "Number of tokens in a comment line");
                var rndTokens = tokensByLine[3];
                assert.equal(rndTokens[0].m_category.value, rnd.Category.CAT_COMMENT.value, "token is a comment");
            });
            
            test("block comment and statement in one line", function (assert) {
                var buf = new rnd.StringBuffer();
                buf.append("view ez_case_test as select from sflight\r\n");
                buf.append("left outer join saplane on sflight.planetype = saplane.planetype\r\n");
                buf.append("{ \r\n");
                buf.append("     sflight.connid /*as connections,*/\r\n");
                buf.append("     sflight.fldate,\r\n");
                buf.append("     count(distinct saplane.producer) as abc");
                var source = buf.toString();
                var tokens = getTokensForSource(source);
                
                var tokensByLine = new commonddlNonUi.DdlSourceColoringCacheHelper().convertTokensToLineCache(tokens);
                
                assert.equal(6, Object.keys(tokensByLine).length, "Number of lines in cache" );
                assert.equal(4, tokensByLine[3].length, "Number of tokens in a block comment line");
                var rndTokens = tokensByLine[3];
                assert.equal(rndTokens[3].m_category.value, rnd.Category.CAT_COMMENT.value, "token is a comment");
            });
            
            test("block comment over several lines", function (assert) {
                var buf = new rnd.StringBuffer();
                buf.append("view ez_case_test as select from sflight\r\n");
                buf.append("left outer join saplane on sflight.planetype = saplane.planetype\r\n");
                buf.append("{ \r\n");
                buf.append("     /*sflight.connid as connections,\r\n");
                buf.append("     sflight.fldate,*/\r\n");
                buf.append("     count(distinct saplane.producer) as abc");
                var source = buf.toString();
                var tokens = getTokensForSource(source);
                
                var tokensByLine = new commonddlNonUi.DdlSourceColoringCacheHelper().convertTokensToLineCache(tokens);
                
                assert.equal(6, Object.keys(tokensByLine).length, "Number of lines in cache" );
                assert.equal(1, tokensByLine[3].length, "Number of tokens in a block comment line 1");
                var rndTokens = tokensByLine[3];
                assert.equal(rndTokens[0].m_category.value, rnd.Category.CAT_COMMENT.value, "token is a comment");
                assert.equal(1, tokensByLine[4].length, "Number of tokens in a block comment line 2");
                var rndTokens2 = tokensByLine[4];
                assert.equal(rndTokens2[0].m_category.value, rnd.Category.CAT_COMMENT.value, "token is a comment");
            });
            
            test("statement and a literal in one line", function (assert) {
                var buf = new rnd.StringBuffer();
                buf.append("define view sales_orders_2012\r\n");
                buf.append("as select from snwd_so {\r\n");
                buf.append("key snwd_so.so_id, \r\n");
                buf.append("     snwd_so.buyer_guid as customer_guid\r\n");
                buf.append("     } where snwd_so.created_at > '201112310000000000000'\r\n");
                buf.append("\r\n");
                var source = buf.toString();
                var tokens = getTokensForSource(source);
                
                var tokensByLine = new commonddlNonUi.DdlSourceColoringCacheHelper().convertTokensToLineCache(tokens);
                
                assert.equal(6, Object.keys(tokensByLine).length, "Number of lines in cache" );
                assert.equal(7, tokensByLine[4].length, "Number of tokens in a line with literal");
                var rndTokens = tokensByLine[4];
                assert.equal(rndTokens[6].m_category.value, rnd.Category.CAT_LITERAL.value, "token is a literal");
            });
            
            test("literal over two lines", function (assert) {
                var buf = new rnd.StringBuffer();
                buf.append("define view sales_orders_2012\r\n");
                buf.append("as select from snwd_so {\r\n");
                buf.append("key snwd_so.so_id, \r\n");
                buf.append("     snwd_so.buyer_guid as customer_guid\r\n");
                buf.append("     } where snwd_so.created_at > '2011123100000000\r\n");
                buf.append("     00000'\r\n");
                var source = buf.toString();
                var tokens = getTokensForSource(source);
                
                var tokensByLine = new commonddlNonUi.DdlSourceColoringCacheHelper().convertTokensToLineCache(tokens);
                
                assert.equal(7, Object.keys(tokensByLine).length, "Number of lines in cache" );
                var rndTokens = tokensByLine[4];
                assert.equal(rndTokens[6].m_category.value, rnd.Category.CAT_LITERAL.value, "token is a literal");
                var rndTokens2 = tokensByLine[5];
                assert.equal(rndTokens2[0].m_category.value, rnd.Category.CAT_LITERAL.value, "token is a literal");
            });
            
            QUnit.start();
        }
);