define(["watt/resources/sap/watt/hanaplugins/test-resources/editor/plugin/hdbcalculationview/Util",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/model",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/RepositoryXmlParser",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/view/CalcViewEditorUtil",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/commands",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/view/SemanticsColumnsPane",
        
    ],
    function(Util, viewmodel, RepositoryXmlParser, CalcViewEditorUtil, commands,SemanticsColumnsPane) {

        "use strict";

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
        var i18n = {
            applyTo: sinon.spy()
        };
        var context = {
            i18n: i18n,
            service: {
                catalogDAO: {
                    sqlMultiExecute: function(statment, setting, callback) {
                        var result = {

                        };
                        callback(result);
                    },
                    getSchemas: function() {}
                }
            }
        };
        
        
        var columnView = model.columnView;
        var viewNode = columnView._defaultNode;
        var attributes = {
            undoManager: model.$getUndoManager(),
            context: context,
            model: model,
            isScriptNode: false,
            viewNode: viewNode
        };


        var semanticsColumnsPane = new SemanticsColumnsPane(attributes);



        var selectedNode = model.columnView.getDefaultNode();

        var viewNodeProperties = {
            columns: []
        };
        selectedNode.elements.foreach(function(element) {
            viewNodeProperties.columns.push(CalcViewEditorUtil.createModelForElement(element, selectedNode, model.columnView));
        });

        var cc = semanticsColumnsPane.getContent();
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(viewNodeProperties);
        cc.bindRows("/columns");
        cc.setModel(oModel);
        sap.ui.getCore().applyChanges();
        cc.placeAt("SCTest");
        cc.setBindingContext({
            getObject: function() {
                return {
                    name: "Aggregation"
                };
            }
        });
        var oTable;
        QUnit.module('Ui Unit Test For Semantic Columns ', {
            setup: function() {
                oTable = cc;
            },
            teardown: function() {
                oTable = null;
            }
        });
        QUnit.test("InitialOk", function() {

            equal(oTable.getBinding("rows").getLength(), 9, "Row count is correct!");

        });

        QUnit.test("SelectedIndex", 1, function() {
            oTable.setSelectedIndex(8);
            equals(oTable.getSelectedIndex(), 8, "Selected Index is 8!");
            oTable.setSelectedIndex();
        });
        QUnit.test("VisibleRowCount", 1, function() {
            oTable.setVisibleRowCount(10);
            equals(oTable.getVisibleRowCount(), 10, "Visible Row Count is set correct!");
        });
        QUnit.test("EnableColumnReordering", 1, function() {
            oTable.setEnableColumnReordering(true);
            equals(oTable.getEnableColumnReordering(), true, "Reordering is allowed");
        });

        QUnit.test("ColumnMenu", 2, function() {
            var oColumn = oTable.getColumns()[1];
            var oMenu = oColumn.getMenu();
            ok(oMenu !== null, "Column menu is not null");
            ok(oMenu instanceof sap.ui.table.ColumnMenu, "Column menu is instance of sap.ui.table.ColumnMenu");

        });
        
        QUnit.test("ToolBar", function() {
            var toolBar = oTable.getToolbar();
            equals(toolBar.getItems()[0].getEnabled(), false, "Initially Attribute button is disabled ");
            equals(toolBar.getItems()[1].getEnabled(), true, "Initially Measure button is disabled");
            equals(toolBar.getItems()[2].getEnabled(), true, "Initially Assign Semantics button is disabled ");
            equals(toolBar.getItems()[3].getEnabled(), true, "Initially Extract Semantics button is enabled");
            oTable.setSelectedIndex(2);
            equals(toolBar.getItems()[4].getEnabled(), true, " After Index selectionMeasure button is enabled");
            equals(toolBar.getItems()[2].getEnabled(), true, " After Index selectionAssign Semantics button is enabled ");
            oTable.setSelectedIndex();
        });
        QUnit.test("Name Collumn", function() {
            var nameCol = cc.getRows()[0].getCells()[3];
            equals(nameCol.getValue(),selectedNode.elements.getAt(1).name, "Initially Name Collumn first Index value is " + nameCol.getValue());
            nameCol.setValue("VAS");
            nameCol.fireChange({
            	newValue: "VAS"
            });
            sap.ui.getCore().applyChanges();
            equals(nameCol.getValue(), selectedNode.elements.getAt(1).name, "After updated with 'VAS'Name Collumn first Index value is " + nameCol.getValue());
        });
        QUnit.test("'Label' Collumn", function() {
            var labelCol = cc.getRows()[0].getCells()[4];
            equals(labelCol.getValue(), selectedNode.elements.getAt(1).label,"Initially Label Collumn first Index value is " + labelCol.getValue());
            labelCol.setValue("V1");
            labelCol.fireChange({
                newValue: "V1"
            });
            sap.ui.getCore().applyChanges();
            equals(labelCol.getValue(), selectedNode.elements.getAt(1).label, "After updated with 'V1'  Label Collumn first Index value is " + labelCol.getValue());
        });
         QUnit.test("Engine Aggregation Collumn", function() {
            var engAggCol = cc.getRows()[0].getCells()[5];
                equals(engAggCol.getValue(), selectedNode.elements.getAt(1).engineAggregation.toUpperCase(), "Initially Engine Aggregation Collumn first Index value is " + engAggCol.getValue());
                engAggCol.setValue("COUNT");
                engAggCol.fireChange({
                    newValue: "COUNT"
                });
                sap.ui.getCore().applyChanges();
               equals(engAggCol.getValue(), selectedNode.elements.getAt(1).engineAggregation.toUpperCase(), "After updating Engine Aggregation Collumn first Index value is " + engAggCol.getValue());
            
        });
      /*  QUnit.test("Default Aggregation Collumn", function() {

           var defAggCol = cc.getRows()[0].getCells()[6];
                equals(defAggCol.getValue(), selectedNode.elements.getAt(1).aggregationBehavior.toUpperCase(), "Default Engine Aggregation Collumn first Index value is " + defAggCol.getValue());
                defAggCol.setValue("MAX");
                defAggCol.fireChange({
                    newValue: "MAX"
                });
                sap.ui.getCore().applyChanges();
               equals(defAggCol.getValue(), selectedNode.elements.getAt(1).aggregationBehavior.toUpperCase(), "After updating Default Aggregation Collumn first Index value is " + defAggCol.getValue());
    
        });*/
        QUnit.test("Variable Collumn", function() {

           var VarFiled = cc.getRows()[1].getCells()[6];
                equals(VarFiled.getValue(), "", "Variable Collumn first Index value is " + VarFiled.getValue());
                
        });
        QUnit.test("'LabelCollumn'", function() {
            var labelCol = cc.getRows()[4].getCells()[7];
            console.log(labelCol.getId());
               // equals(labelCol.getValue(),"", "Initially Label Collumn value  fifth Index value is " + labelCol.getValue());
                labelCol.setValue(labelCol.getItems()[1].getKey()) ;
                labelCol.fireChange({
    				newValue: labelCol.getItems()[1].getKey(),
    				selectedItem: labelCol.getItems()[1].getKey()
    			});
                sap.ui.getCore().applyChanges();
               ok(selectedNode.elements.getAt(4).labelElement.name, "After updating Label Collumn value  2nd Index value is " + labelCol.getValue());
            
        });
        QUnit.test("Hidden Collumn", function() {
            var hiddCol = cc.getRows()[1].getCells()[8];          
            equals(hiddCol.getChecked(), selectedNode.elements.getAt(2).hidden,"Initially Hidden Collumn check box  is checked "+hiddCol.getChecked());
            hiddCol.setChecked(true);
            hiddCol.fireChange({
                checked: true 
            });
            sap.ui.getCore().applyChanges();
           equals(hiddCol.getChecked(), selectedNode.elements.getAt(2).hidden,"After update checked Hidden Collumn check box  is checked "+hiddCol.getChecked());
        });
        QUnit.test("Drill Down Collumn", function() {
            var ddCol = cc.getRows()[4].getCells()[10];
             equals(ddCol.getValue(), (selectedNode.elements.getAt(3).drillDownEnablement === "DRILL_DOWN")?"Drill Down":"","Initially Drill Down  Collumn value is "+ddCol.getValue());
           ddCol.fireChange({
                selectedItem:ddCol.getItems()[0].sId
            });
            sap.ui.getCore().applyChanges();
           equals(ddCol.getValue(),  (selectedNode.elements.getAt(3).drillDownEnablement === "DRILL_DOWN")?"Drill Down":"","After update Drill Down Collumn Collumn value is"+ddCol.getValue());
  
        });
        QUnit.test("Keep Flag CheckBox ", function() {
            var keepFlag = cc.getRows()[4].getCells()[13];
             equals(keepFlag.getChecked(), selectedNode.elements.getAt(5).keep ," Keep Flag CheckBox Collumn value is "+keepFlag.getChecked());
           keepFlag.setChecked(true);
            keepFlag.fireChange({
                checked: true 
            });
            sap.ui.getCore().applyChanges();
             equals(keepFlag.getChecked(), selectedNode.elements.getAt(5).keep ,"Initially Keep Flag CheckBox Collumn value is "+keepFlag.getChecked());
               });
         QUnit.test("Mapping  CheckBox", function() {
            var trFilter = cc.getRows()[4].getCells()[14];
             ok(trFilter.getText() ,"MappingCollumn value is "+trFilter.getText());
                 });
        QUnit.test("Assigning Same Name for 2nd Time", function() {
            var nameCol = cc.getRows()[4].getCells()[3];
            ok(nameCol.getValue(), "Initially Name Collumn first Index value is " + nameCol.getValue()+" Now Assign U5 its already there");
            nameCol.setValue("U2");
            nameCol.fireChange({
                newValue: "U2"
            });
            sap.ui.getCore().applyChanges();
            equals(nameCol.getValueState(), "Error", "After updated with 'U5'Name Collumn first Index value is " +nameCol.getValueState());
            
        });
    });