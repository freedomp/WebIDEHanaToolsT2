RequirePaths.setRequireJsConfigForHanaDdl(2);

define(
    [ "commonddl/commonddlNonUi",
        "TestUtilEclipseSelectionHandling",
        "rndrt/rnd",
        "hanaddl/hanaddlNonUi",
        "hanaddl/hanaddlUi",
        "./AbstractV3HanaDdlParserTests",
        "./TestFriendlyHanaRepositoryAccess",
        "hanaddl/hanav1/CdsDdlParserResolver",
        "hanaddl/hanav2/CdsDdlParserResolver",
        "hanaddl/hanav3/CdsDdlParserResolver",
        "hanaddl/hanav4/CdsDdlParserResolver",
        "hanaddl/hanav5/CdsDdlParserResolver"

    ], // dependencies
    function (commonddlNonUi, TestUtilEclipseSelectionHandling, rnd, hanaddlNonUi, hanaddlUi, AbstractV3HanaDdlParserTests, TestFriendlyHanaRepositoryAccess) {
        var IBaseCdsDdlParserConstants = hanaddlNonUi.IBaseCdsDdlParserConstants;
        var version = hanaddlNonUi.VersionsFactory.versionLast;
        var parser = hanaddlNonUi.DdlParserFactoryRespectingBackendVersion.eInstance.createParser(version);
        var resolver = hanaddlNonUi.DdlParserFactoryRespectingBackendVersion.eInstance.createResolver(version);

        function getByType(list, type) {
            var result = [];
            for (var i = 0; i < list.length; i++) {
                if (list[i].type === type) {
                    result.push(list[i]);
                }
            }
            return result;
        }

        function get(list, name) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].name === name) {
                    return list[i];
                }
            }
            return null;
        }

        TestHelperHanaDdlTokenizerWithWorker.prototype = Object.create(hanaddlUi.HanaDdlTokenizerWithWorker.prototype);
        function TestHelperHanaDdlTokenizerWithWorker(sourceList) {
            function Range(row, column, row, length) {
                this.row = row;
            }

            hanaddlUi.HanaDdlTokenizerWithWorker.call(this, Range);
            this.sourceDocument = {
                $lines: sourceList
            };
            this.aceEditor = {
                getSession: function () {
                    return {
                        addMarker: function (p1, p2, p3) {

                        }
                    };
                }
            };
        }

        TestHelperHanaDdlTokenizerWithWorker.prototype.createWorker = function () {
            // Do nothing
        };

        TestHelperHanaDdlTokenizerWithWorker.prototype.setLineCache = function (tokensByLine) {
            this.tokensByLine = tokensByLine;
        };

        QUnit.asyncTest("backend returns CDS_ENTITY and TABLE with same name; ensure 'generated' tables are not shown", function (assert) {
            expect(3);
            var hanaRepAccess = new hanaddlUi.HanaRepositoryAccess.HanaRepositoryAccess1();
            var MetadataServices = hanaddlNonUi.MetadataServices;
            var origSearch = MetadataServices.searchService.search;
            try {
                MetadataServices.searchService.search = function (searchStr, searchMode, maxResult, isFullNameSearch, isSynonymSearch, isCaseInsensitiveSearch, onComplete, onError, context) {
                    var data_unit = {metadata: []};
                    data_unit.metadata.push({mainType: "TABLE", objectName: "namespace::context.name"});
                    data_unit.metadata.push({mainType: "CDS_ENTITY", objectName: "namespace::context.name"});
                    onComplete(data_unit);
                };
                hanaRepAccess.aceEditor = {execCommand: function () {
                    var res = hanaRepAccess.getDataSourceNames("stubbed");
                    assert.equal(res.length, 1);
                    assert.equal(res[0].name, '"namespace::context.name"');
                    assert.equal(res[0].type.name, "ENTITY");
                    QUnit.start();
                }};
                hanaRepAccess.getDataSourceNames("stubbed");
            } finally {
                MetadataServices.searchService.search = origSearch;
            }
        });

        QUnit.asyncTest("get data source type - CDS_ENTITY preferred over TABLE", function (assert) {
            expect(1);
            var hanaRepAccess = new hanaddlUi.HanaRepositoryAccess.HanaRepositoryAccess1();
            var MetadataServices = hanaddlNonUi.MetadataServices;
            var origSearch = MetadataServices.searchService.search;
            try {
                MetadataServices.searchService.search = function (searchStr, searchMode, maxResult, isFullNameSearch, isSynonymSearch, isCaseInsensitiveSearch, onComplete, onError, context) {
                    var data_unit = {metadata: []};
                    data_unit.metadata.push({mainType: "TABLE", objectName: "namespace::context.name"});
                    data_unit.metadata.push({mainType: "CDS_ENTITY", objectName: "namespace::context.name"});
                    onComplete(data_unit);
                };

                hanaRepAccess.getDataSourceType("namespace::context.name", function (type) {
                    assert.equal(type, "CDS_ENTITY");
                    QUnit.start();
                });
            } finally {
                MetadataServices.searchService.search = origSearch;
            }
        });

        test("merge client and backend results", function (assert) {
            var sourceWithSelections = "context ctx { entity test { }; define view v as select from t#selection.one# };";
            var source = [ "" ];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                sourceWithSelections, source, selections);
            var sel = selections["one"];
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            //fuzzy logic for backend result - name does not start with "t" - ensure that result is visible
            repAccess.dataSourceNames = [
                {name: '"com.sap.test::context.long_ttest"', type: IBaseCdsDdlParserConstants.ENTITY_TYPE}
            ];
            var completions = parser.getTypedCodeCompletions5(
                resolver,
                repAccess,
                source[0], 1, sel.getOffset() + 1);
            var compl = get(completions, "test");
            equal(compl.name, "test");
            ok(compl.replacementLength !== undefined);
            ok(compl.replacementOffset !== undefined);
            ok(compl.isBackendCompletion === undefined);
            equal(compl.type, IBaseCdsDdlParserConstants.ENTITY_TYPE);

            compl = get(completions, 'long_ttest');
            equal(compl.getAdditionalDisplayString(), 'com.sap.test::context.long_ttest');
            equal(compl.externalNameDecl, 'com.sap.test::context.long_ttest');
            ok(compl.replacementLength !== undefined);
            ok(compl.replacementOffset !== undefined);
            ok(compl.isBackendCompletion == true);
            equal(compl.type, IBaseCdsDdlParserConstants.ENTITY_TYPE);
        });

        test("no duplicate proposal for same result from client and backend", function (assert) {
            var sourceWithSelections = "context ctx { entity test { }; define view v as select from t#selection.one# };";
            var source = [ "" ];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                sourceWithSelections, source, selections);
            var sel = selections["one"];
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.dataSourceNames = [
                {name: '"com.sap::context.test"', type: IBaseCdsDdlParserConstants.ENTITY_TYPE}
            ];
            var completions = parser.getTypedCodeCompletions5(
                resolver,
                repAccess,
                source[0], 1, sel.getOffset() + 1);
            var compl = get(completions, 'test');
            equal(compl.name, 'test');
            ok(compl.replacementLength !== undefined);
            ok(compl.replacementOffset !== undefined);
            ok(compl.isBackendCompletion === undefined);
            equal(compl.type, IBaseCdsDdlParserConstants.ENTITY_TYPE);
        });

        test("no duplicate proposal for same result from client and backend (backend wins)", function (assert) {
            var sourceWithSelections = "context ctx {  entity Employee { };define view v as select from c#selection.one# };";
            var source = [ "" ];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                sourceWithSelections, source, selections);
            var sel = selections["one"];
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.dataSourceNames = [
                {name: '"com.sap::ctx.Employee"', type: IBaseCdsDdlParserConstants.ENTITY_TYPE}
            ];
            var completions = parser.getTypedCodeCompletions5(
                resolver,
                repAccess,
                source[0], 1, sel.getOffset() + 1);
            var compl = get(completions, 'Employee');
            equal(compl.getAdditionalDisplayString(), 'com.sap::ctx.Employee');
            ok(compl.replacementLength !== undefined);
            ok(compl.replacementOffset !== undefined);
            ok(compl.isBackendCompletion === true);
            equal(compl.type, IBaseCdsDdlParserConstants.ENTITY_TYPE);
        });

        test("complete all table column names", function (assert) {
            var sourceWithSelections = "context ctx { define view v as select from backend_datasource { #selection.one# }; };";
            var source = [ "" ];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                sourceWithSelections, source, selections);
            var sel = selections["one"];
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.columnNames = ["COLUMN1", "COLUMN2", "VCOLUMN3"];
            var completions = parser.getTypedCodeCompletions5(
                resolver,
                repAccess,
                source[0], 1, sel.getOffset() + 1);
            var elementCompletions = getByType(completions, IBaseCdsDdlParserConstants.ELEMENT_TYPE);
            equal(elementCompletions.length, 3);
            equal(elementCompletions[0].name, "COLUMN1");
            ok(elementCompletions[0].isBackendCompletion === true);
        });

        test("complete table column names filter taken into account", function (assert) {
            var sourceWithSelections = "context ctx { define view v as select from backend_datasource { col#selection.one# }; };";
            var source = [ "" ];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                sourceWithSelections, source, selections);
            var sel = selections["one"];
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.columnNames = ["COLUMN1", "COLUMN2", "VCOLUMN3"];
            var completions = parser.getTypedCodeCompletions5(
                resolver,
                repAccess,
                source[0], 1, sel.getOffset() + 1);
            var elementCompletions = getByType(completions, IBaseCdsDdlParserConstants.ELEMENT_TYPE);
            equal(elementCompletions.length, 2);
            equal(elementCompletions[0].name, "COLUMN1");
            ok(elementCompletions[0].isBackendCompletion === true);
            equal(elementCompletions[1].name, "COLUMN2");
            ok(elementCompletions[1].isBackendCompletion === true);
        });

        test("complete catalog table name", function (assert) {
            var sourceWithSelections = "context ctx { define view v as select from \"playground.test::v#selection.one#iew\" { col }; };";
            var source = [ "" ];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                sourceWithSelections, source, selections);
            var sel = selections["one"];
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.dataSourceNames = [
                {name: '"playground.test::view1234"', type: IBaseCdsDdlParserConstants.ENTITY_TYPE}
            ];
            var completions = parser.getTypedCodeCompletions5(
                resolver,
                repAccess,
                source[0], 1, sel.getOffset() + 1);
            var compl = get(completions, 'view1234');
            ok(compl != null);
            equal(compl.replacementOffset, 43);
            equal(compl.replacementLength, 23);
            ok(compl.isBackendCompletion === true);
        });

        test("complete datasource starting with quote (result has no quote)", function (assert) {
            var sourceWithSelections = "context ctx { define view v as select from \"melch#selection.one# { col }; };";
            var source = [ "" ];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                sourceWithSelections, source, selections);
            var sel = selections["one"];
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.dataSourceNames = [
                {name: 'melch_syno', type: IBaseCdsDdlParserConstants.ENTITY_TYPE}
            ];

            var tok = new TestHelperHanaDdlTokenizerWithWorker();
            tok.sourceDocument = {};
            tok.sourceDocument.$lines = [source[0]];
            tok.parser = parser;
            tok.resolver = resolver;
            var res = tok.getCompls({row: 0, column: sel.getOffset()}, "melch", -1, repAccess);
            equal(res[1].name, "melch_syno");
            equal(res[1].replacementOffset, 43);
            equal(res[1].replacementLength, "\"melch".length);
        });

        test("complete datasource with quotes at end before quote", function (assert) {
            var sourceWithSelections = "context ctx { define view v as select from \"playground.melcher::melch1#selection.one#\" { col }; };";
            var source = [ "" ];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                sourceWithSelections, source, selections);
            var sel = selections["one"];
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.dataSourceNames = [
                {name: '"playground.melcher::melch1"', type: IBaseCdsDdlParserConstants.ENTITY_TYPE}
            ];

            var tok = new TestHelperHanaDdlTokenizerWithWorker();
            tok.sourceDocument = {};
            tok.sourceDocument.$lines = [source[0]];
            tok.parser = parser;
            tok.resolver = resolver;
            var res = tok.getCompls({row: 0, column: sel.getOffset()}, "melch1", -1, repAccess);
            equal(res[0].getAdditionalDisplayString(), "playground.melcher::melch1");
            equal(res[0].replacementOffset, 43);
            equal(res[0].replacementLength, "\"playground.melcher::melch1\"".length);
        });

        test("complete columns for select list entries path containing datasource", function (assert) {
            var sourceWithSelections = "context ctx { define view v as select from \"playground.melcher::melch1\" { \"playground.melcher::melch1\".#selection.one# }; };";
            var source = [ "" ];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                sourceWithSelections, source, selections);
            var sel = selections["one"];
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.dataSourceNames = [
                {name: '"playground.melcher::melch1"', type: IBaseCdsDdlParserConstants.ENTITY_TYPE}
            ];
            repAccess.columnNames = ["COLUMN1", "COLUMN2", "VCOLUMN3"];

            var tok = new TestHelperHanaDdlTokenizerWithWorker();
            tok.sourceDocument = {};
            tok.sourceDocument.$lines = [source[0]];
            tok.parser = parser;
            tok.resolver = resolver;
            var res = tok.getCompls({row: 0, column: sel.getOffset()}, "melch1", -1, repAccess);
            ok(get(res, "COLUMN1") != null);
            ok(get(res, "COLUMN2") != null);
            ok(get(res, "VCOLUMN3") != null);
        });

        test("complete columns for select list entries path containing datasource alias", function (assert) {
            var sourceWithSelections = "context ctx { define view v as select from \"playground.melcher::melch1\" as ali { ali.#selection.one# }; };";
            var source = [ "" ];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                sourceWithSelections, source, selections);
            var sel = selections["one"];
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.dataSourceNames = [
                {name: '"playground.melcher::melch1"', type: IBaseCdsDdlParserConstants.ENTITY_TYPE}
            ];
            repAccess.columnNames = ["COLUMN1", "COLUMN2", "VCOLUMN3"];

            var tok = new TestHelperHanaDdlTokenizerWithWorker();
            tok.sourceDocument = {};
            tok.sourceDocument.$lines = [source[0]];
            tok.parser = parser;
            tok.resolver = resolver;
            var res = tok.getCompls({row: 0, column: sel.getOffset()}, "melch1", -1, repAccess);
            ok(get(res, "COLUMN1") != null);
            ok(get(res, "COLUMN2") != null);
            ok(get(res, "VCOLUMN3") != null);
        });

        test("complete datasource name with quotes in select list", function (assert) {
            var sourceWithSelections = "context ctx { define view v as select from \"playground.melcher::melch1\"  { \"playground.melcher::mel#selection.one#  } where SYS  ; };";
            var source = [ "" ];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                sourceWithSelections, source, selections);
            var sel = selections["one"];
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.dataSourceNames = [
                {name: '"playground.melcher::melch1"', type: IBaseCdsDdlParserConstants.ENTITY_TYPE}
            ];
            repAccess.columnNames = ["COLUMN1", "COLUMN2", "VCOLUMN3"];

            var tok = new TestHelperHanaDdlTokenizerWithWorker();
            tok.sourceDocument = {};
            tok.sourceDocument.$lines = [source[0]];
            tok.parser = parser;
            tok.resolver = resolver;
            var res = tok.getCompls({row: 0, column: sel.getOffset()}, "melch1", -1, repAccess);
            ok(get(res, "\"playground.melcher::melch1\"") != null);
        });

        TestHelperHanaDdlTokenizerWithWorker.prototype = Object.create(hanaddlUi.HanaDdlTokenizerWithWorker.prototype);
        function TestHelperHanaDdlTokenizerWithWorker(sourceList) {
            function Range(row, column, row, length) {
                this.row = row;
            }

            hanaddlUi.HanaDdlTokenizerWithWorker.call(this, Range);
            this.sourceDocument = {
                $lines: sourceList
            };
            this.aceEditor = {
                getSession: function () {
                    return {
                        addMarker: function (p1, p2, p3) {

                        }
                    };
                }
            };
        }

        TestHelperHanaDdlTokenizerWithWorker.prototype.createWorker = function () {
            // Do nothing
        };

        TestHelperHanaDdlTokenizerWithWorker.prototype.setLineCache = function (tokensByLine) {
            this.tokensByLine = tokensByLine;
        };

        test("show loading entry for long running backend data sources request", function (assert) {
            var source = [
                "namespace playground.zavozina;",
                "context coco_test { ",
                "  entity e1 { id:Integer; };",
                "  context nested {",
                "     entity e1 { nestedId:Integer; };",
                "  };",
                "define view v as select from ",
            ];
            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.dataSourceNames = commonddlNonUi.AbstractDdlParser.INCOMPLETE_SIGNAL;
            var compls = cut.getCompls({row: source.length - 1, column: source[source.length - 1].length}, "", undefined, repAccess);
            equal(compls[0].name, "Loading code completion results ...");
            var allCommandStrings = [];
            var allMoveTos = [];
            var editor = {
                selection: {
                    getCursor: function () {
                        return null;
                    },
                    moveTo: function (a, b) {
                        allMoveTos.push({row: a, column: b});
                    },
                    selectTo: function (a, b) {

                    }
                },
                execCommand: function (param, string) {
                    allCommandStrings.push(string);
                }
            };
            cut.insertCompletion(editor, compls[0], null);
            assert.equal(allCommandStrings.length, 0); // ensure that no text is inserted when selecting the "loading ..." entry
        });

        test("show loading entry for long running backend data source columns request", function (assert) {
            var source = [
                "namespace playground.zavozina;",
                "context coco_test { ",
                "  entity e1 { id:Integer; };",
                "  context nested {",
                "     entity e1 { nestedId:Integer; };",
                "  };",
                "define view v as select from db { ",
            ];
            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.columnNames = commonddlNonUi.AbstractDdlParser.INCOMPLETE_SIGNAL;
            var compls = cut.getCompls({row: source.length - 1, column: source[source.length - 1].length}, "", undefined, repAccess);
            equal(compls[0].name, "Loading code completion results ...");
            var allCommandStrings = [];
            var allMoveTos = [];
            var editor = {
                selection: {
                    getCursor: function () {
                        return null;
                    },
                    moveTo: function (a, b) {
                        allMoveTos.push({row: a, column: b});
                    },
                    selectTo: function (a, b) {

                    }
                },
                execCommand: function (param, string) {
                    allCommandStrings.push(string);
                }
            };
            cut.insertCompletion(editor, compls[0], null);
            assert.equal(allCommandStrings.length, 0); // ensure that no text is inserted when selecting the "loading ..." entry
        });

        test("no keyword completion after unfinished quoted identitifier", function (assert) {
            var sourceWithSelections = "context ctx { define view v as select from \"playground.melcher::me#selection.one#lch1\"  { field  }; };";
            var source = [ "" ];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                sourceWithSelections, source, selections);
            var sel = selections["one"];
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            var completions = parser.getTypedCodeCompletions5(
                resolver,
                repAccess,
                source[0], 1, sel.getOffset() + 1);
            equal(completions.length, 0);
        });

        test("backend completions together with client keyword proposals", function (assert) {
            var sourceWithSelections = "context ctx { define view v as select from melch_#selection.one#sy  { field  }; };";
            var source = [ "" ];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                sourceWithSelections, source, selections);
            var sel = selections["one"];
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.dataSourceNames = [
                {name: 'melch_synooo', type: IBaseCdsDdlParserConstants.ENTITY_TYPE}
            ];

            var tok = new TestHelperHanaDdlTokenizerWithWorker();
            tok.sourceDocument = {};
            tok.sourceDocument.$lines = [source[0]];
            tok.parser = parser;
            tok.resolver = resolver;
            var res = tok.getCompls({row: 0, column: sel.getOffset()}, "melch_", -1, repAccess);
            ok(res.length >= 3);
            var compl = get(res, "melch_synooo");
            equal(compl.replacementColumn, sel.getOffset() - "melch_".length);
            equal(compl.replacementLength, "melch_sy".length);
            compl = get(res, ".");
            equal(compl.replacementColumn, sel.getOffset());
            equal(compl.replacementLength, 0);
            compl = get(res, "{");
            equal(compl.replacementColumn, sel.getOffset());
            equal(compl.replacementLength, 0);
        });

        test("add using for coco cds entity retrieved from backend", function (assert) {
            var source = [
                "namespace playground.zavozina;",
                "context coco_test { ",
                "define view v as select from my",
            ];

            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.dataSourceNames = [
                {name: '"com.sap::myentity"', type: IBaseCdsDdlParserConstants.ENTITY_TYPE}
            ];
            var compls = cut.getCompls({row: source.length - 1, column: source[source.length - 1].length}, "", undefined, repAccess);
            equal(compls[0].name, "myentity");
            equal(compls[0].externalNameDecl, "com.sap::myentity");
            var allCommandStrings = [];
            var editor = {
                selection: {
                    getCursor: function () {
                        return null;
                    },
                    moveTo: function (a, b) {

                    },
                    selectTo: function (a, b) {

                    }
                },
                execCommand: function (param, string) {
                    allCommandStrings.push(string);
                }
            };
            cut.insertCompletion(editor, compls[0], null);
            assert.equal(allCommandStrings[0], "myentity");
            assert.equal(allCommandStrings[1], "\r\nusing com.sap::myentity;");
        });

        test("add using with alias for coco cds entity retrieved from backend", function (assert) {
            var source = [
                "namespace playground.zavozina;",
                "using com.sap.another.package::myentity;",
                "context coco_test { ",
                "define view v as select from my",
            ];

            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.dataSourceNames = [
                {name: '"com.sap::myentity"', type: IBaseCdsDdlParserConstants.ENTITY_TYPE}
            ];
            var compls = cut.getCompls({row: source.length - 1, column: source[source.length - 1].length}, "", undefined, repAccess);
            equal(compls[0].name, "myentity");
            equal(compls[0].externalNameDecl, "com.sap::myentity");
            var allCommandStrings = [];
            var editor = {
                selection: {
                    getCursor: function () {
                        return null;
                    },
                    moveTo: function (a, b) {

                    },
                    selectTo: function (a, b) {

                    }
                },
                execCommand: function (param, string) {
                    allCommandStrings.push(string);
                }
            };
            cut.insertCompletion(editor, compls[0], null);
            assert.equal(allCommandStrings[0], "myentityAlias");
            assert.equal(allCommandStrings[1], "\r\nusing com.sap::myentity as myentityAlias;");
        });

        test("don't show backend cds entity completion when same local entity is proposed", function (assert) {
            var source = [
                "namespace com.sap;",
                "using com.sap.another.package::myentity;",
                "context ctx { ",
                " entity myentity { key id:Integer; };",
                "define view v as select from my",
            ];

            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.dataSourceNames = [
                {name: '"com.sap::ctx.myentity"', type: IBaseCdsDdlParserConstants.ENTITY_TYPE}
            ];
            var compls = cut.getCompls({row: source.length - 1, column: source[source.length - 1].length}, "", undefined, repAccess);
            for (var i = 0; i < compls.length; i++) {
                if (compls[i].name === "myentity") {
                    ok(compls[i].externalNameDecl == null);
                }
            }
        });

        test("add using for coco cds entity retrieved from backend at correct position", function (assert) {
            var source = [
                "",
                "",
                "namespace playground.zavozina;",
                "context coco_test { ",
                "define view v as select from my",
            ];

            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.dataSourceNames = [
                {name: '"com.sap::myentity"', type: IBaseCdsDdlParserConstants.ENTITY_TYPE}
            ];
            var compls = cut.getCompls({row: source.length - 1, column: source[source.length - 1].length}, "", undefined, repAccess);
            equal(compls[0].name, "myentity");
            equal(compls[0].externalNameDecl, "com.sap::myentity");
            var allCommandStrings = [];
            var allMoveTos = [];
            var editor = {
                selection: {
                    getCursor: function () {
                        return null;
                    },
                    moveTo: function (a, b) {
                        allMoveTos.push({row: a, column: b});
                    },
                    selectTo: function (a, b) {

                    }
                },
                execCommand: function (param, string) {
                    allCommandStrings.push(string);
                }
            };
            cut.insertCompletion(editor, compls[0], null);
            assert.equal(allCommandStrings[0], "myentity");
            assert.equal(allCommandStrings[1], "\r\nusing com.sap::myentity;");
            assert.equal(4, allMoveTos[0].row);
            assert.equal(29, allMoveTos[0].column);
            assert.equal(2, allMoveTos[1].row);
            assert.equal(30, allMoveTos[1].column);
        });

        test("coco columns and assocs from backend for select list entry", function (assert) {
            var source = [
                "namespace playground.zavozina;",
                "using com.sap::ctx.myentity;",
                "context coco_test { ",
                "define view v as select from myentity { ",
            ];

            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.columnNames = ["STATUS", "STATUS_UPDATED_AT", "SYSTEM_ID"];
            var compls = cut.getCompls({row: source.length - 1, column: source[source.length - 1].length}, "", undefined, repAccess);
            var compl = get(compls, "STATUS");
            ok(compl != null);
            var compl = get(compls, "STATUS_UPDATED_AT");
            ok(compl != null);
            var compl = get(compls, "SYSTEM_ID");
            ok(compl != null);
        });

        test("coco columns and assocs from backend for select list entry; datasource with using alias", function (assert) {
            var source = [
                "namespace playground.zavozina;",
                "using com.sap::ctx.myentity as ali;",
                "context coco_test { ",
                "define view v as select from ali { ",
            ];

            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.columnNames = ["STATUS", "STATUS_UPDATED_AT", "SYSTEM_ID"];
            var compls = cut.getCompls({row: source.length - 1, column: source[source.length - 1].length}, "", undefined, repAccess);
            var compl = get(compls, "STATUS");
            ok(compl != null);
            var compl = get(compls, "STATUS_UPDATED_AT");
            ok(compl != null);
            var compl = get(compls, "SYSTEM_ID");
            ok(compl != null);
        });

        test("no using for local entity proposed from backend completion", function (assert) {
            var source = [
                "namespace playground.zavozina;",
                "context coco_test { ",
                "  entity e1 { id:Integer; };",
                "  context nested {",
                "     entity e1 { nestedId:Integer; };",
                "  };",
                "define view v as select from my",
            ];

            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.dataSourceNames = [
                {name: '"playground.zavozina::coco_test.e1"', type: IBaseCdsDdlParserConstants.ENTITY_TYPE}
            ];
            var compls = cut.getCompls({row: source.length - 1, column: source[source.length - 1].length}, "", undefined, repAccess);
            equal(compls[0].name, "e1");
            equal(compls[0].externalNameDecl, "playground.zavozina::coco_test.e1");
            var allCommandStrings = [];
            var allMoveTos = [];
            var editor = {
                selection: {
                    getCursor: function () {
                        return null;
                    },
                    moveTo: function (a, b) {
                        allMoveTos.push({row: a, column: b});
                    },
                    selectTo: function (a, b) {

                    }
                },
                execCommand: function (param, string) {
                    allCommandStrings.push(string);
                }
            };
            cut.insertCompletion(editor, compls[0], null);
            assert.equal(allCommandStrings.length, 1);
            assert.equal(allCommandStrings[0], "coco_test.e1");
        });

        test("no using for local nested entity proposed from backend completion", function (assert) {
            var source = [
                "namespace playground.zavozina;",
                "context coco_test { ",
                "  entity e1 { id:Integer; };",
                "  context nested {",
                "     entity e1 { nestedId:Integer; };",
                "  };",
                "define view v as select from my",
            ];

            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.dataSourceNames = [
                {name: '"playground.zavozina::coco_test.nested.e1"', type: IBaseCdsDdlParserConstants.ENTITY_TYPE}
            ];
            var compls = cut.getCompls({row: source.length - 1, column: source[source.length - 1].length}, "", undefined, repAccess);
            equal(compls[0].name, "e1");
            equal(compls[0].externalNameDecl, "playground.zavozina::coco_test.nested.e1");
            var allCommandStrings = [];
            var allMoveTos = [];
            var editor = {
                selection: {
                    getCursor: function () {
                        return null;
                    },
                    moveTo: function (a, b) {
                        allMoveTos.push({row: a, column: b});
                    },
                    selectTo: function (a, b) {

                    }
                },
                execCommand: function (param, string) {
                    allCommandStrings.push(string);
                }
            };
            cut.insertCompletion(editor, compls[0], null);
            assert.equal(allCommandStrings.length, 1);
            assert.equal(allCommandStrings[0], "coco_test.nested.e1");
        });

        QUnit.asyncTest("no matching data source type found", function (assert) {
            expect(0);
            var hanaRepAccess = new hanaddlUi.HanaRepositoryAccess.HanaRepositoryAccess1();
            var MetadataServices = hanaddlNonUi.MetadataServices;
            var origSearch = MetadataServices.searchService.search;
            try{
                MetadataServices.searchService.search = function(searchStr, searchMode, maxResult, isFullNameSearch, isSynonymSearch, isCaseInsensitiveSearch, onComplete, onError, context) {
                    var data_unit = {metadata:[]};
                    data_unit.metadata.push({mainType:"SYNONYM",objectName:"datasourcename"});
                    data_unit.metadata.push({mainType:"SYNONYM",objectName:"datasourcename"});
                    onComplete(data_unit);
                };
                hanaRepAccess.aceEditor = {execCommand:function() {
                }};
                hanaRepAccess.getDataSourceType("datasourcename",function() {
                    fail("");
                    QUnit.start();
                },function() {
                    QUnit.start();
                });
            }finally{
                MetadataServices.searchService.search = origSearch;
            }
        });

        QUnit.asyncTest("complete backend type for entity element",function(assert) {
            expect(5);
            var source = [
                "namespace playground.zavozina;",
                "context coco_test { ",
                "  entity e1 {",
                "     field : "
            ];

            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.cdsTypeNames = [
                {name: 'playground.zavozina::coco_test2.mytype', type: IBaseCdsDdlParserConstants.TYPE_TYPE}
            ];
            var compls = cut.getCompls({row: source.length - 1, column: source[source.length - 1].length}, "", undefined, repAccess);
            var compl = get(compls,"mytype");
            equal(compl.name, "mytype");
            equal(compl.externalNameDecl, "playground.zavozina::coco_test2.mytype");
            var allCommandStrings = [];
            var allMoveTos = [];
            var editor = {
                selection: {
                    getCursor: function () {
                        return null;
                    },
                    moveTo: function (a, b) {
                        allMoveTos.push({row: a, column: b});
                    },
                    selectTo: function (a, b) {

                    }
                },
                execCommand: function (param, string) {
                    allCommandStrings.push(string);
                }
            };
            cut.insertCompletion(editor, compl, null);
            assert.equal(allCommandStrings.length, 2);
            assert.equal(allCommandStrings[0], "mytype");
            assert.equal(allCommandStrings[1], "\r\nusing playground.zavozina::coco_test2.mytype;");
            QUnit.start();
        });

        QUnit.asyncTest("complete backend context for entity element",function(assert) {
            expect(5);
            var source = [
                "namespace playground.zavozina;",
                "context coco_test { ",
                "  entity e1 {",
                "     field : "
            ];

            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.cdsTypeNames = [
                {name: 'playground.zavozina::coco_test2', type: IBaseCdsDdlParserConstants.CONTEXT_TYPE}
            ];
            var compls = cut.getCompls({row: source.length - 1, column: source[source.length - 1].length}, "", undefined, repAccess);
            var compl = get(compls,"coco_test2");
            equal(compl.name, "coco_test2");
            equal(compl.externalNameDecl, "playground.zavozina::coco_test2");
            var allCommandStrings = [];
            var allMoveTos = [];
            var editor = {
                selection: {
                    getCursor: function () {
                        return null;
                    },
                    moveTo: function (a, b) {
                        allMoveTos.push({row: a, column: b});
                    },
                    selectTo: function (a, b) {

                    }
                },
                execCommand: function (param, string) {
                    allCommandStrings.push(string);
                }
            };
            cut.insertCompletion(editor, compl, null);
            assert.equal(allCommandStrings.length, 2);
            assert.equal(allCommandStrings[0], "coco_test2");
            assert.equal(allCommandStrings[1], "\r\nusing playground.zavozina::coco_test2;");
            QUnit.start();
        });

        QUnit.asyncTest("backend returns same context and type for entity element (has to be ignored/filtered out)",function(assert) {
            expect(2);
            var source = [
                "namespace playground.zavozina;",
                "context coco_test { ",
                "  type mylocal : Integer;",
                "  entity e1 {",
                "     field : ",
                "  ;",
                "  };",
                "};"
            ];

            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.cdsTypeNames = [
                {name: 'playground.zavozina::coco_test', type: IBaseCdsDdlParserConstants.CONTEXT_TYPE},
                {name: 'playground.zavozina::coco_test.mylocal', type: IBaseCdsDdlParserConstants.TYPE_TYPE}
            ];
            var compls = cut.getCompls({row: 4, column: source[4].length}, "", undefined, repAccess);
            var compl = get(compls,"mylocal");
            equal(compl.name, "mylocal");
            ok(compl.externalNameDecl == null);
            QUnit.start();
        });

        QUnit.asyncTest("complete backend type for type element",function(assert) {
            expect(5);
            var source = [
                "namespace playground.zavozina;",
                "context coco_test { ",
                "  type e1 {",
                "     field : "
            ];

            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.cdsTypeNames = [
                {name: 'playground.zavozina::coco_test2', type: IBaseCdsDdlParserConstants.CONTEXT_TYPE}
            ];
            var compls = cut.getCompls({row: source.length - 1, column: source[source.length - 1].length}, "", undefined, repAccess);
            var compl = get(compls,"coco_test2");
            equal(compl.name, "coco_test2");
            equal(compl.externalNameDecl, "playground.zavozina::coco_test2");
            var allCommandStrings = [];
            var allMoveTos = [];
            var editor = {
                selection: {
                    getCursor: function () {
                        return null;
                    },
                    moveTo: function (a, b) {
                        allMoveTos.push({row: a, column: b});
                    },
                    selectTo: function (a, b) {

                    }
                },
                execCommand: function (param, string) {
                    allCommandStrings.push(string);
                }
            };
            cut.insertCompletion(editor, compl, null);
            assert.equal(allCommandStrings.length, 2);
            assert.equal(allCommandStrings[0], "coco_test2");
            assert.equal(allCommandStrings[1], "\r\nusing playground.zavozina::coco_test2;");
            QUnit.start();
        });

        QUnit.asyncTest("complete backend type for simple type",function(assert) {
            expect(5);
            var source = [
                "namespace playground.zavozina;",
                "context coco_test { ",
                "  type e1 : "
            ];

            var cut = new TestHelperHanaDdlTokenizerWithWorker(source);
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            repAccess.cdsTypeNames = [
                {name: 'playground.zavozina::coco_test2.type', type: IBaseCdsDdlParserConstants.TYPE_TYPE}
            ];
            var compls = cut.getCompls({row: source.length - 1, column: source[source.length - 1].length}, "", undefined, repAccess);
            var compl = get(compls,"type");
            equal(compl.name, "type");
            equal(compl.externalNameDecl, "playground.zavozina::coco_test2.type");
            var allCommandStrings = [];
            var allMoveTos = [];
            var editor = {
                selection: {
                    getCursor: function () {
                        return null;
                    },
                    moveTo: function (a, b) {
                        allMoveTos.push({row: a, column: b});
                    },
                    selectTo: function (a, b) {

                    }
                },
                execCommand: function (param, string) {
                    allCommandStrings.push(string);
                }
            };
            cut.insertCompletion(editor, compl, null);
            assert.equal(allCommandStrings.length, 2);
            assert.equal(allCommandStrings[0], "type");
            assert.equal(allCommandStrings[1], "\r\nusing playground.zavozina::coco_test2.type;");
            QUnit.start();
        });


        //TODO: funktioniert columns completion für cds views?
        //TODO: plain cds views completion with using directive inserter - not the generated views
        //TODO: type of ... - propose type/entity with their elements (with longer paths) from backend
        //TODO: association to ... - backend code completion for entities

        QUnit.start();
    });



// create synonym for testing (docu https://help.sap.com/saphelp_hanaone/helpdata/en/20/d5412b75191014bc7ec7e133ce5bf5/content.htm)
//CREATE SYNONYM "D031119"."melch_syno" FOR "_SYS_REPO"."ACTIVE_CONTENT_TEXT_CONTENT"
