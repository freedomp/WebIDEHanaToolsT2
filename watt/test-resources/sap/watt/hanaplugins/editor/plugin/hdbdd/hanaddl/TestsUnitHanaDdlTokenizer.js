RequirePaths.setRequireJsConfigForHanaDdl(2);

require(
    [
        "rndrt/rnd", "hanaddl/hanaddlUi", "commonddl/commonddlNonUi",
        "./TestFriendlyHanaRepositoryAccess",
        "hanaddl/hanav1/CdsDdlParserResolver",
        "hanaddl/hanav2/CdsDdlParserResolver",
        "hanaddl/hanav3/CdsDdlParserResolver",
        "hanaddl/hanav4/CdsDdlParserResolver",
        "hanaddl/hanav5/CdsDdlParserResolver"
    ],
    function (rnd, hanaddlUi, commonddlNonUi, TestFriendlyHanaRepositoryAccess) {

        var HanaDdlTokenizerWithWorker = hanaddlUi.HanaDdlTokenizerWithWorker;

        // Test Helper

        TestHelperHanaDdlTokenizerWithWorker.prototype = Object.create(HanaDdlTokenizerWithWorker.prototype);
        function TestHelperHanaDdlTokenizerWithWorker(sourceList) {
            function Range(startRow, startColumn, endRow, length) {
                this.row = startRow;
            }
            HanaDdlTokenizerWithWorker.call(this, Range);
            this.sourceDocument= {
                $lines:sourceList
            };
            this.aceEditor={
                getSession:function() {
                    return {
                        addMarker: function(p1,p2,p3) {
                        },
                        addGutterDecoration: function(p1,p2) {
                        }
                    };
                }
            };
            this.createTooltip = function (editor, text, row, column, length) {
                return null;
            };
        }

        TestHelperHanaDdlTokenizerWithWorker.prototype.createWorker = function () {
        };

        TestHelperHanaDdlTokenizerWithWorker.prototype.setLineCache = function(tokensByLine) {
            this.tokensByLine = tokensByLine;
        };

        function getFirstKeywordCompletionForName(completions, completionName) {

            for (var i = 0; i < completions.length; i++) {
                var completion = completions[i];

                if (completion instanceof commonddlNonUi.DdlKeywordCodeCompletionProposal && completion.name === completionName) {
                    return completion;
                }
            }

            return null;
        }

        // Tests

        test("annotation literal coloring",function(assert) {
            var source = [
                "namespace playground.zavozina;",
                "@Annotation: 'KATJA001' ",
                "context coco_test { ",
                "entity en1 { ",
                "    /*    key en1Key: Integer;",
                "     element1 : Integer;",
                "     element2 : UTCDateTime;*/",
                "    element hh: Binary(10);",
                "};",
                "entity en2 {",
                "    key en2Key: Integer;",
                "    el2 : String(2);",
                "    assocTo1 : association to en1;",
                "};*/"
            ];
            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var rndTokens = cut.parser.parseSource(cut.resolver,source);
            var tokensByLine = new commonddlNonUi.DdlSourceColoringCacheHelper().convertTokensToLineCache(rndTokens);
            cut.setLineCache(tokensByLine);

            var line = "@Annotation: 'KATJA001' ";
            var row = source.indexOf(line);
            var aceTokens = cut.getLineTokens(line,0,row);
            var found=false;
            for (var i= 0;i<aceTokens.tokens.length;i++) {
                var at = aceTokens.tokens[i];
                if (at.value==" 'KATJA001'") {
                    equal(at.type,"meta.tag");
                    found=true;
                    break;
                }
            }
            ok(found);
        });

        test("properties set for keyword completion", function (assert) {
            var source = ["define"];
            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            var compls = cut.getCompls({row: 0, column: 1}, "", "", repAccess);

            ok(compls, "completions array not null");
            ok(compls.length > 0, "at least one completion present");

            var compl = getFirstKeywordCompletionForName(compls, "define");
            equal(compl.name, "define", "completion is define");
            equal(compl.replacementRow, 0, "replacementRow set correctly");
            equal(compl.replacementColumn, 1, "replacementColumn set correctly");
            equal(compl.replacementLength, 0, "replacementLength set correctly");
        });

        test("properties set for keyword completion with many spaces before", function (assert) {
            var source = [
                "namespace myNamespace;",
                "context myContext {",
                "   entity myEntity {",
                "      myAssociation :          asso", // row: 3, column: 35
                "   }",
                "}"
            ];
            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            var compls = cut.getCompls({row: 3, column: 35}, "asso", "", repAccess);

            ok(compls, "completions array not null");
            ok(compls.length > 0, "at least one completion present");

            var compl = getFirstKeywordCompletionForName(compls, "association");
            equal(compl.name, "association", "completion is association");
            equal(compl.replacementRow, 3, "replacementRow set correctly");
            equal(compl.replacementColumn, 31, "replacementColumn set correctly");
            equal(compl.replacementLength, 4, "replacementLength set correctly");
        });

        test("properties set for keyword completion for associations", function (assert) {
            {
                var source = [
                    "namespace myNamespace;",
                    "context myContext {",
                    "   entity myEntity {",
                    "      myAssociation : a", // row: 3, column: 22
                    "   }",
                    "}"
                ];
                var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
                var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
                var compls = cut.getCompls({row: 3, column: 22}, "a", "", repAccess);

                ok(compls, "completions array not null");
                ok(compls.length > 0, "at least one completion present");

                var compl = getFirstKeywordCompletionForName(compls, "association");
                equal(compl.name, "association", "completion is association");
                equal(compl.replacementRow, 3, "replacementRow set correctly");
                equal(compl.replacementColumn, 21, "replacementColumn set correctly");
                equal(compl.replacementLength, 1, "replacementLength set correctly");
            }

            {
                var source = [
                    "namespace myNamespace;",
                    "context myContext {",
                    "   entity myEntity {",
                    "      myAssociation : ass", // row: 3, column: 24
                    "   }",
                    "}"
                ];
                var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
                var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
                var compls = cut.getCompls({row: 3, column: 24}, "ass", "", repAccess);

                ok(compls, "completions array not null");
                ok(compls.length > 0, "at least one completion present");

                var compl = getFirstKeywordCompletionForName(compls, "association");
                equal(compl.name, "association", "completion is association");
                equal(compl.replacementRow, 3, "replacementRow set correctly");
                equal(compl.replacementColumn, 21, "replacementColumn set correctly");
                equal(compl.replacementLength, 3, "replacementLength set correctly");
            }
        });

        function findFirstClosingBracketToken(aceTokens) {
            for (var i=0;i<aceTokens.length;i++) {
                if (rnd.Utils.stringTrim(aceTokens[i].value)==="}")
                    return aceTokens[i];
            }
            return null;
        }

        test("erroneous keywords should be marked as keyword",function(assert) {
            var source = [
                "namespace playground.melcher;                                                                   "+//
                "context cctest0003 {                                                                            "+//
                "define view view_with_assoc as select from e1                                                   "+//
                "mixin { assoc1: association [* ] to tm1active.firstRow on e1.k1 = tm1active.firstRow.value2 ;   "+//
                "    assoc2: association to e2 on e1.f1 =  m                                                     "+//
                "}                                                                                               "+//
                "into {                                                                                          "+//
                "    assoc1.id2 as ID2 }                                                                         "+//
                ";                                                                                               "+//
                "}                                                                                               "
            ];
            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var rndTokens = cut.parser.parseSource(cut.resolver,source);
            var tokensByLine = cut.convertRndTokensToAce(rndTokens,0);
            var token = findFirstClosingBracketToken(tokensByLine);
            equal("keyword",token.type);
        });

        test("insert :aspect",function(assert) {
            var source = [
                "NAMESPACE name.space;"+//
                "ACCESSPOLICY acName { "+//
                "DEFINE ASPECT asp1 AS SELECT FROM v1 { "+//
                "    v1.f1 "+//
                "} WHERE $user IN v1.f1; "+//
                "DEFINE ROLE roleName{ "+//
                "    GRANT SELECT ON c1.v1 "+//
                "    WHERE ASPECT "
            ];
            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var compls = cut.getCompls({row:0,column:source[0].length},"");
            equal(compls[0].name,"asp1");
            var lastCommandString=null;
            var editor={
                selection:{
                    getCursor : function() {
                        return null;
                    },
                    moveTo:function(a,b) {

                    },
                    selectTo:function(a,b) {

                    }
                },
                execCommand:function(param,string) {
                    lastCommandString=string;
                }
            };
            cut.insertCompletion(editor,compls[0],null);
            equal(lastCommandString,":asp1");
        });

        test("insert annotation",function(assert) {
            var source = [
                    "@C"
            ];
            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var compls = cut.getCompls({row:0,column:source[0].length},"");
            equal(compls[0].name,"Catalog.index: ");
            var lastCommandString=null;
            var editor={
                selection:{
                    getCursor : function() {
                        return null;
                    },
                    moveTo:function(a,b) {

                    },
                    selectTo:function(a,b) {

                    }
                },
                execCommand:function(param,string) {
                    lastCommandString=string;
                }
            };
            cut.insertCompletion(editor,compls[0],null);
            equal(lastCommandString,"Catalog.index: [{name: '', unique: true, order: #ASC, elementNames: ['']}]");
        });

        test("insert keyword after identifier - dcl scenario",function(assert) {
            // error was that the completion "." has overriden the token "address" before the cursor position
            var source = [
            "namespace playground.melcher; "+//
            "using playground.melcher::dcl_base.salesOrderView; "+//
            "using playground.melcher::dcl_base.address; "+//
            "define AccessPolicy dcl_test { "+//
            "    define aspect aspCountry as "+//
            "    select from address"
            ];
            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var off = source[0].length;
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            var compls = cut.getCompls({row:0,column:off},"address",off,repAccess);
            equal(compls[0].name,".");
            var lastCommandString=null;
            var moveToRow;
            var moveToColumn;
            var selectToRow;
            var selectToColumn;
            var editor={
                selection:{
                    getCursor : function() {
                        return null;
                    },
                    moveTo:function(a,b) {
                        moveToRow = a;
                        moveToColumn = b;
                    },
                    selectTo:function(a,b) {
                        selectToRow = a;
                        selectToColumn = b;
                    }
                },
                execCommand:function(param,string) {
                    lastCommandString=string;
                }
            };
            cut.insertCompletion(editor,compls[0],null);
            equal(lastCommandString,".");
            equal(0,moveToRow);
            equal(off,moveToColumn);
            equal(0,selectToRow);
            equal(off,selectToColumn);
        });

        QUnit.start();
    });
