
define(["watt/resources/sap/watt/hanaplugins/editor/plugin/cds/model/model",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/cds/model/Parser",
		"watt/resources/sap/watt/hanaplugins/editor/plugin/cds/view/columns/ColumnsPane",
		"watt/resources/sap/watt/hanaplugins/editor/plugin/cds/view/CDSEditorUtil"
       ], 

    function(viewmodel, Parser,ColumnPane,CDSEditorUtil) {

        "use strict";

        var model = new viewmodel.CDSModel(true);
        ( function() {
            var url = "../testdata/" + "data.hdbcds";
            $.ajax({
                url: url,
                async: false,
                dataType: "text"
            })
                .done(function(data) {
                    data = data.replace(/\x0d/g, ""); // remove CR added by REST API 
                  
                    Parser.parseValue(data, model);

                    
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
		
		var columnPane = new ColumnPane({
            model: model,
            entity: model.root.children.getAt(0),
            undoManager: model.$getUndoManager(),
            context: context,
            
        });

        var columnPane = columnPane.getContent();
        
		
		var entityProperties = {
					columns: [],
					associations: []
				};
		var cdsArtifact=model.root.children.getAt(0);
		if (cdsArtifact instanceof viewmodel.Entity) {
			cdsArtifact.elements.foreach(function(element) {
				if (element instanceof viewmodel.Element) {
						entityProperties.columns.push(CDSEditorUtil.createModelForElement(element, model.root, cdsArtifact));
				} else if (element instanceof viewmodel.Association) {
						entityProperties.associations.push(CDSEditorUtil.createModelForAssociation(element, model.root, cdsArtifact));
				}
			});
		}
		
		
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(entityProperties);
        columnPane.bindRows("/columns");
        columnPane.setModel(oModel);
        sap.ui.getCore().applyChanges();
		columnPane.placeAt("columnsPaneTest");
		
		 var oTable;
        QUnit.module('Ui Unit Test For Semantic Columns ', {
            setup: function() {
                oTable = columnPane;
            },
            teardown: function() {
                oTable = null;
            }
        });
        QUnit.test("InitialOk", function() {

            equal(oTable.getBinding("rows").getLength(), 2, "Row count is correct!");

        });
        

        QUnit.test("SelectedIndex", 1, function() {
            oTable.setSelectedIndex(2);
            equals(oTable.getSelectedIndex(), 2, "Selected Index is 2!");
            oTable.setSelectedIndex();
        });
        QUnit.test("VisibleRowCount", 1, function() {
            oTable.setVisibleRowCount(4);
            equals(oTable.getVisibleRowCount(), 4, "Visible Row Count is set correct!");
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
        
        QUnit.test("Change Name", function() {
            var nameCol = columnPane.getRows()[0].getCells()[0];
            equals(nameCol.getValue(),cdsArtifact.elements.getAt(0).name, "Name Column first Index value is " + nameCol.getValue());
            nameCol.setValue("CUSTOMER_ID");
            nameCol.fireChange({
            	newValue: "CUSTOMER_ID"
            });
            sap.ui.getCore().applyChanges();
            equals(nameCol.getValue(), cdsArtifact.elements.getAt(0).name, "After updated with 'CUSTOMER_ID' Name column first Index value is " + nameCol.getValue());
        });
		
        
        QUnit.test("Change Type", function() {
            var nameCol = columnPane.getRows()[0].getCells()[2];
            equals(nameCol.getValue(),cdsArtifact.elements.getAt(0).inlineType.primitiveType, "Type Collumn first Index value is " + nameCol.getValue());
            nameCol.setValue("String");
            nameCol.fireChange({
            	newValue: "String"
            });
            //sap.ui.getCore().applyChanges();
           // oModel.refresh(true)
            equals(nameCol.getValue(), cdsArtifact.elements.getAt(0).inlineType.primitiveType, "After updated with 'String' Collumn first Index value is " + nameCol.getValue());
        });
		
		 QUnit.test("ToolBar", function() {
            var toolBar = columnPane.getToolbar();
            
           
            columnPane.setSelectedIndex(1);
           equals(toolBar.getItems()[0].getEnabled(), false, "Initially Attribute button is disabled ");
            equals(toolBar.getItems()[1].getEnabled(), false, "Initially Measure button is disabled");
            columnPane.setSelectedIndex();
        });
    });