define(["watt/resources/sap/watt/hanaplugins/test-resources/editor/plugin/hdbcalculationview/Util",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/model",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/RepositoryXmlParser",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/view/CalcViewEditorUtil",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/commands",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/view/DetailsPropertiesPane",
        
    ],
    function(Util, viewmodel, RepositoryXmlParser, CalcViewEditorUtil, commands,DetailsPropertiesPane) {

        "use strict";

        var model = new viewmodel.ViewModel(true);
        ( function() {
            var url =   require.toUrl("/watt/resources/sap/watt/hanaplugins/test-resources/editor/plugin/hdbcalculationview/testdata/") + "ViewPropertiesTest.hdbcalculationview.xml";
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
    	var pAttributes = {
    			model: model,
    			undoManager: model.$getUndoManager(),
    			context: context,
    			isScriptNode: false
    		};

    		var detailsPropertiesPane = new DetailsPropertiesPane(pAttributes);
    		var viewProperties = detailsPropertiesPane.getContent();
    		viewProperties.placeAt("ViewPropertiesTest");
    		var columnView = model.columnView;
    		var oModel = new sap.ui.model.json.JSONModel();
    		oModel.setData({
    			name: model.columnView.name,
    			label: model.columnView.label,
    			dimensionType: model.columnView.dimensionType,
    			dataCategory: model.columnView.dataCategory,
    			clientDependent: model.columnView.clientDependent,
    			fixedClient: model.columnView.fixedClient,
    			applyPrivilegeType: model.columnView.applyPrivilegeType,
    			preferredEngine: model.columnView.executionHints.preferredEngine,
    			defaultSchema: model.columnView.defaultSchema,
    			cacheInvalidationPeriod: model.columnView.executionHints.cacheInvalidationPeriod,
    			defaultMember: model.columnView.defaultMember,
    			historyEnabled: model.columnView.historyEnabled,
    			historyParamName: model.columnView.historyParamName,
    			deprecated: model.columnView.deprecated,
    			translationRelevant: model.columnView.translationRelevant,
    			alwaysAggregateResult:  model.columnView.executionHints.alwaysAggregateResult
    		});
    		viewProperties.setModel(oModel);
    		
    		QUnit.module('Viewproperties UI  Test ', {
    			setup: function() {

    			},
    			teardown: function() {}
    		});
    		
    		QUnit.test(" Genral pane test case for name field", function() {
    			var nameTextBox = sap.ui.getCore().byId(viewProperties.$().find(".dummyTest1")[0].id);
    			equals(nameTextBox.getValue(), columnView.name, "Intially Name Text field value is " + nameTextBox.getValue());
    			equals(nameTextBox.getValue(), columnView.name, " Name Text field Editable  is " + nameTextBox.getEnabled());
    		});
    		QUnit.test(" Genral pane test case for label field", function() {
    			var labelBox = sap.ui.getCore().byId(viewProperties.$().find(".dummyTest2")[0].id);
    			equals(labelBox.getValue(), columnView.label, "Intially Label Text field value is " + labelBox.getValue());
    			equals(labelBox.getValue(), columnView.name, " Label Text field Editable  is " + labelBox.getEnabled());
    			labelBox.setValue("TestLabel");
    			labelBox.fireChange({
    				newValue: "TestLabel"
    			});
    			sap.ui.getCore().applyChanges();
    			equals(labelBox.getValue(), columnView.label, "After upadating Label Text field value is " + labelBox.getValue());
    			 model.$getUndoManager().undo();
     			sap.ui.getCore().applyChanges();
    		});
    		QUnit.test(" Genral pane test case for Type field", function() {
    			var typeField = sap.ui.getCore().byId(viewProperties.$().find(".dummyTest3")[0].id);
    			equals(typeField.getValue(), columnView.dimensionType, "Intially 'Type'  field value is " + typeField.getValue());
    			equals(typeField.getValue(), columnView.dimensionType, " 'Type'   field Editable  is " + typeField.getEnabled());
    		});
    		QUnit.test(" Genral pane test case for Data Category field", function() {
    			var datacategory = sap.ui.getCore().byId(viewProperties.$().find(".dummyTest4")[0].id);
    			equals(datacategory.getValue(), columnView.dataCategory, "Intially 'Type'  field value is " + datacategory.getValue());
    			datacategory.setValue(datacategory.getItems()[1].getKey());
    			datacategory.fireChange({
    				newValue: datacategory.getItems()[2].getKey(),
    				selectedItem: datacategory.getItems()[2].getKey()
    			});
    			sap.ui.getCore().applyChanges();
    			equals(datacategory.getValue(), columnView.dataCategory, "After Upadating 'Type'  field value is " + datacategory.getValue());
    		});
    		QUnit.test(" Genral pane test case for Apply Priviliges field", function() {
    			var applyPrivileges = sap.ui.getCore().byId(viewProperties.$().find(".dummyTest7")[0].id);
    			var applyPrivilege = function() {
    				if ((columnView.applyPrivilegeType) == "ANALYTIC_PRIVILEGE") {
    					return "Analytic Privileges";
    				} else if ((columnView.applyPrivilegeType) == "SQL_ANALYTIC_PRIVILEGE") {
    					return "SQL Analytic Privileges";
    				}
    				else{
    					
    					return "";
    				}
    			};
    			equals(applyPrivileges.getValue(), applyPrivilege(), "Intially 'Apply Priviliges'  field value is " + applyPrivileges.getValue());
    			applyPrivileges.setValue(applyPrivileges.getItems()[0].getText());

    			applyPrivileges.fireChange({
    				newValue: applyPrivileges.getItems()[0].getKey(),
    				selectedItem: applyPrivileges.getItems()[0].getKey()
    			});
    			sap.ui.getCore().applyChanges();
    			equals(applyPrivileges.getValue(), applyPrivilege(), "After Upadating 'Apply Priviliges'  field value is " + applyPrivileges.getValue());
    		});
    		QUnit.test(" Genral pane test case for Default member field", function() {
    			var defaultMember = sap.ui.getCore().byId(viewProperties.$().find(".dummyTest10")[0].id);
    			equals(defaultMember.getValue(), (columnView.defaultMember === undefined) ? "" : (columnView.defaultMember),
    				"Intially Label Text field value is " + defaultMember.getValue());
    			defaultMember.setValue("DefaltMemDemo");
    			defaultMember.fireChange({
    				newValue: "DefaltMemDemo"
    			});
    			sap.ui.getCore().applyChanges();
    			equals(defaultMember.getValue(), (columnView.defaultMember === undefined) ? "" : (columnView.defaultMember),
    				"After upadating Label Text field value is " + defaultMember.getValue());
    		});
    		QUnit.test("GENERAL Pane Testcase for deprecated Check Box", function() {
    			var deprecated = sap.ui.getCore().byId(viewProperties.$().find(".dummyTest15")[0].id);
    			equals(deprecated.getChecked(), columnView.deprecated, "Intialy deprecated check field value is " + columnView.deprecated);
    			deprecated.setChecked(true);
    			deprecated.fireChange({
    				checked: true
    			});
    			sap.ui.getCore().applyChanges();
    			equals(deprecated.getChecked(), columnView.deprecated, "After updating  deprecated check field value is " + columnView.deprecated);

    		});
    		QUnit.test("GENERAL Pane Testcase for Translate Check Box", function() {
    			var translate = sap.ui.getCore().byId(viewProperties.$().find(".dummyTest16")[0].id);
    			equals(translate.getChecked(), columnView.translationRelevant, "Intialy translate check field value is " + columnView.translationRelevant);
    			translate.setChecked(false);
    			translate.fireChange({
    				checked: false
    			});
    			sap.ui.getCore().applyChanges();
    			equals(translate.getChecked(), columnView.translationRelevant, "After updating translate check field value is " + columnView.translationRelevant);
    			$( ".sapUiDlgCloseBtn" ).click();
    		});
    		QUnit.test("ADVANCED Pane Testcase for History Cache Invalidation Period Paramete Field", function() {
    			var cacheInvalid = sap.ui.getCore().byId(viewProperties.$().find(".dummyTest13")[0].id);
    			var cacche = function() {
    				if ((columnView.executionHints.cacheInvalidationPeriod) == "HOURLY") {
    					return "Hourly";
    				} else if ((columnView.executionHints.cacheInvalidationPeriod) == "DAILY") {
    					return "Daily";
    				} else {
    					return "";
    				}
    			};
    			equals(cacheInvalid.getValue(), cacche(), "Intially Execute In Text field value is " + cacheInvalid.getValue());
    			cacheInvalid.setValue(cacheInvalid.getItems()[2].getText());
    			cacheInvalid.fireChange({
    				newValue: cacheInvalid.getItems()[2].getKey(),
    				selectedItem: cacheInvalid.getItems()[2].getKey()
    			});
    			sap.ui.getCore().applyChanges();
    			equals(cacheInvalid.getValue(), cacche(), "Intially Execute In Text field value is " + cacheInvalid.getValue());
    			cacheInvalid.setValue(cacheInvalid.getItems()[1].getText());
    			cacheInvalid.fireChange({
    				newValue: cacheInvalid.getItems()[1].getKey(),
    				selectedItem: cacheInvalid.getItems()[1].getKey()
    			});
    			sap.ui.getCore().applyChanges();
    			equals(cacheInvalid.getValue(), cacche(), "Intially Execute In Text field value is " + cacheInvalid.getValue());
    
    		});
    		QUnit.test("GENERAL Pane Testcase for Always Aggregate Check Box", function() {
    			var alwaysAggregate = sap.ui.getCore().byId(viewProperties.$().find(".dummyTest14")[0].id);
    			var aggre = function(value) {
    				if (value === undefined) {
    					return false;
    				}
    				else{
    					return value;
    				}
    			};
    			equals(alwaysAggregate.getChecked(),aggre(columnView.executionHints.alwaysAggregateResult), "Intialy Always Aggregate result check field value is " +aggre(columnView.executionHints.alwaysAggregateResult));
    			alwaysAggregate.setChecked(true);
    			alwaysAggregate.fireChange({
    				checked: true
    			});
    			sap.ui.getCore().applyChanges();
    			
    			equals(alwaysAggregate.getChecked(), aggre(columnView.executionHints.alwaysAggregateResult), "After updating  Always result Aggregate check field value is " +aggre( columnView.executionHints.alwaysAggregateResult));

    		}); 
    		QUnit.test("ExecutionHints Pane Testcase for Table", function() {
  			  var executionTable= sap.ui.getCore().byId(viewProperties.$().find(".view-table")[0].id);
  			  var addBtn =executionTable.getToolbar().getItems()[0];
  			  addBtn.firePress({});
  			var nameCol = executionTable.getRows()[0].getCells()[0];
  			  var valueCol = executionTable.getRows()[0].getCells()[1];
              equal(nameCol.getValue(),columnView.executionHints.genericHints.getAt(0).name,"intially Exeecution table 'name' first row & first cell value is  "+nameCol.getValue());
  		  nameCol.setValue("anand");
  		    nameCol.fireChange({
  		       newValue:"anand" 
  		    });
  		    	sap.ui.getCore().applyChanges();
  		    	equal(nameCol.getValue(),columnView.executionHints.genericHints.getAt(0).name,"After Updating  Exeecution table 'name' first row & first cell value is "+valueCol.getValue());
  		equal(valueCol.getValue(),columnView.executionHints.genericHints.getAt(0).value,"intially Exeecution table 'value' first row & first cell value is  "+valueCol.getValue());
  		  valueCol.setValue("vas");
  		    valueCol.fireChange({
  		       newValue:"vas" 
  		    });
  		    	sap.ui.getCore().applyChanges();
  		    	equal(valueCol.getValue(),columnView.executionHints.genericHints.getAt(0).value,"After Updating  Exeecution table 'value' first row & first cell value is "+nameCol.getValue());
  			});	    
});