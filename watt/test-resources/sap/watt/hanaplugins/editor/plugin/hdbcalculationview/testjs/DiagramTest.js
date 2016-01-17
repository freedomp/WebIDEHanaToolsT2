define([
        "require",
        "watt/resources/sap/watt/hanaplugins/test-resources/editor/plugin/hdbcalculationview/Util",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/model",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/commands",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/diagram/DiagramPane"
    ],
    function(require) {
        "use strict";

        var Util = require("watt/resources/sap/watt/hanaplugins/test-resources/editor/plugin/hdbcalculationview/Util");
        var DiagramPane = require( "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/diagram/DiagramPane");
        var viewmodel = require("watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/model");
        var commands = require(  "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/commands");
        
        var model = new viewmodel.ViewModel(true);
        ( function() {
            var url =   require.toUrl("/watt/resources/sap/watt/hanaplugins/test-resources/editor/plugin/hdbcalculationview/testdata/") + "SemantaicColumnsTest.hdbcalculationview.xml";
            $.ajax({
                url: url,
                async: false,
                dataType: "text"
            })
                .done(function(data) {
                    data = data.replace(/\x0d/g, ""); // remove CR added by REST API 
                    //var calculationViewModel = model.createColumnView(mAttr,skipNodes);
                    RepositoryXmlParser.parseScenario(data, model, true);

                    //   parameter = model.columnView.parameters.getAt(0);
                    // RepositoryXmlParser.parseCalculationView(data);
                    // oModel = calculationViewModel;
                });


        })();
        function createColumnView(name, dataCategory) {            
            
            return model.columnView;
        }

        var placeAt = Util.moduleUI5("DiagramTest");

        function createEditor(model, parentId) {

            var diagramPane = new DiagramPane(model, null, function() {});
            placeAt(diagramPane.getContent(), parentId);

            sap.ui.getCore().applyChanges();

            return diagramPane._editor;
        }

        function verifySymbols(actualSymbols, expectedSymbols) {
            var actualSymbolsData = [];
            actualSymbols.forEach(function(symbol) {
                var symbolData = {
                    classDefinition: symbol.classDefinition.name
                };
                if (symbol.name) {
                    symbolData.name = symbol.name;
                }
                if (symbol.viewNodeName) {
                    symbolData.viewNodeName = symbol.viewNodeName;
                }
                actualSymbolsData.push(symbolData);
            });
            deepEqual(actualSymbolsData, expectedSymbols);
        }

        test("empty diagram", function() {
            var columnView = createColumnView();
            var model = columnView.$getModel();
            var editor = createEditor(model, "calcViewEditorEmpty");

            strictEqual(columnView.viewNodes.count(), 0, "number of view nodes");
            verifySymbols(editor.diagram.symbols, [{
                classDefinition: "SemanticsSymbol"
            }]);
        });

        test("create union symbol", function() {
            var columnView = createColumnView();
            var model = columnView.$getModel();
            var editor = createEditor(model, "calcViewEditorUnion");

            editor.selectTool(editor.extension.UNION_SYMBOL);
            editor.tool.createSymbol(100, 100, 80, 20, true);
            strictEqual(columnView.viewNodes.count(), 1, "number of view nodes after create symbol");
            var viewNodeName = columnView.viewNodes.toArray()[0].name;
            verifySymbols(editor.diagram.symbols, [{
                classDefinition: "SemanticsSymbol"
            }, {
                classDefinition: "UnionSymbol",
                viewNodeName: viewNodeName
            }]);

            model.$getUndoManager().undo();
            strictEqual(columnView.viewNodes.count(), 0, "number of view nodes after undo");
            verifySymbols(editor.diagram.symbols, [{
                classDefinition: "SemanticsSymbol"
            }]);

            model.$getUndoManager().redo();
            strictEqual(columnView.viewNodes.count(), 1, "number of view nodes after redo");
            verifySymbols(editor.diagram.symbols, [{
                classDefinition: "SemanticsSymbol"
            }, {
                classDefinition: "UnionSymbol",
                viewNodeName: viewNodeName
            }]);
        });

        test("view node selected", function(assert) {
            assert.expect(6);
            
            var columnView1 = createColumnView("test1");
            var model1 = columnView1.$getModel();
            var editor1 = createEditor(model1, "calcViewEditorTest1");

            var columnView2 = createColumnView("test2");
            var model2 = columnView2.$getModel();
            var editor2 = createEditor(model2, "calcViewEditorTest2");

            editor1.selectTool(editor1.extension.UNION_SYMBOL);
            var symbol1 = editor1.tool.createSymbol(100, 100, 80, 20, true);
            editor2.selectTool(editor2.extension.PROJECTION_SYMBOL);
            var symbol2 = editor2.tool.createSymbol(100, 100, 80, 20, true);

            assert.strictEqual(columnView1.viewNodes.count(), 1, "number of view nodes in test1 after create symbol");
            assert.strictEqual(columnView2.viewNodes.count(), 1, "number of view nodes in test2 after create symbol");

            var recieved1 = false;
            var recieved2 = false;
            var done1 = assert.async();
            var done2 = assert.async();
            columnView1.$getEvents().subscribe(commands.ViewModelEvents.VIEWNODE_SELECTED, function(event) {
                assert.ok(!recieved1, "selected event for test1 recived twice");
                recieved1 = true;
                assert.strictEqual(event.name, symbol1.viewNodeName, "selected event name for test1");
                done1();
            });
            columnView2.$getEvents().subscribe(commands.ViewModelEvents.VIEWNODE_SELECTED, function(event) {
                assert.ok(!recieved2, "selected event for test2 recived twice");
                recieved2 = true;
                assert.strictEqual(event.name, symbol2.viewNodeName, "selected event name for test2");
                done2();
            });

            editor1.selectSymbol(symbol1, true);
            editor2.selectSymbol(symbol2, true);
        });

    });