define([
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/model",
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/RepositoryXmlParser",            
        "watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/view/ParameterDetails"
    ],
	function( viewmodel, RepositoryXmlParser, ParameterDetails) {

		"use strict";	
		var parameter;
		var model = new viewmodel.ViewModel(true);

		(function() {

			  var url =   require.toUrl("/watt/resources/sap/watt/hanaplugins/test-resources/editor/plugin/hdbcalculationview/testdata/") + "InputParameterTest.hdbcalculationview.xml";
		        	$.ajax({
				url: url,
				async: false,
				dataType: "text"
			})
				.done(function(data) {
				    data = data.replace(/\x0d/g, ""); // remove CR added by REST API                 
                    RepositoryXmlParser.parseScenario(data, model, true);
                   
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
			viewNode: viewNode,
			isSemanticsNode: true,
			undomanager: model.$getUndoManager(),
			context: context,
			parameters: model.columnView.parameters
		};

		var parameterDetails = new ParameterDetails(pAttributes);
		var inputParameter = parameterDetails.getContent();
		inputParameter.placeAt("InputParameterTest");
		var count = 0;
		var typeCombo;
		var parameter = model.columnView.parameters.getAt(0);
		for (var i = 0; i < 10; i++) {
			//viewNode.inputs._values[0]._source.inputs._values[0].mappings._values[i].sourceElement.isProxy = false;
		}

		QUnit.module('Input parameter variable Test ', {
			setup: function() {
				typeCombo = sap.ui.getCore().byId(inputParameter.$().find(".dummyTest4")[0].id);

			},
			teardown: function() {
				typeCombo = null;
			}
		});

		QUnit.test("GENERAL Pane Testcase for Name and Label", function() {
			var nameTextBox = sap.ui.getCore().byId(inputParameter.$().find(".dummyTest1")[0].id);
			equals(nameTextBox.getValue(), parameter.name, "Intialy  name field value is " + nameTextBox.getValue());
			nameTextBox.setValue("TestName");
			nameTextBox.fireChange({
				newValue: "TestName"
			});
			sap.ui.getCore().applyChanges();
			equals(nameTextBox.getValue(), parameter.name, "After  name field value is updated " + nameTextBox.getValue());
			nameTextBox.setValue("IP_1");
			nameTextBox.fireChange({
				newValue: "IP_1"
			});
			sap.ui.getCore().applyChanges();
			var labelTextBox = sap.ui.getCore().byId(inputParameter.$().find(".dummyTest2")[0].id);
			equals(labelTextBox.getValue(), parameter.label, "Intialy Varible label field value is " + labelTextBox.getValue());
			labelTextBox.setValue("TestLabel");
			labelTextBox.fireChange({
				newValue: "TestLabel"
			});
			sap.ui.getCore().applyChanges();
			equals(labelTextBox.getValue(), parameter.label, "After updated  Varible label field value is " + labelTextBox.getValue());

		});
		QUnit.test("GENERAL Pane Testcase for Mandotory Check Box", function() {
			var manCheck = sap.ui.getCore().byId(inputParameter.$().find(".marginFields")[0].id);
			equals(manCheck.getChecked(), (parameter.mandatory === undefined) ? false : (parameter.mandatory),
				"Intialy Mandatory check field value is " + parameter.mandatory);
			manCheck.setChecked(true);
			manCheck.fireChange({
				checked: true
			});
			sap.ui.getCore().applyChanges();
			equals(manCheck.getChecked(), (parameter.mandatory === undefined) ? false : (parameter.mandatory),
				"After updating  Mandatory check field value is " + parameter.mandatory);
		});
		QUnit.test("GENERAL Pane Testcase for Mulitiple Selection  Check Box", function() {
			var multiCheck = sap.ui.getCore().byId(inputParameter.$().find(".dummyTest3")[0].id);
			equals(multiCheck.getChecked(), parameter.multipleSelections, "Intialy Mulitiple Selection check field value is " + parameter.multipleSelections);
			multiCheck.setChecked(true);
			multiCheck.fireChange({
				checked: true
			});
			sap.ui.getCore().applyChanges();
			equals(multiCheck.getChecked(), parameter.multipleSelections, "After updating  Mulitiple Selection check field value is " + parameter.multipleSelections);
			/*multiCheck.setChecked(false);
            multiCheck.fireChange({
                checked: true
            });
            sap.ui.getCore().applyChanges();*/
		});
		QUnit.test("Parameter Type Direct Testcase Semantic drop Down", function(assert) {
			typeCombo.setValue("Direct");
			typeCombo.fireChange({
				newValue: "Direct"
			});
			sap.ui.getCore().applyChanges();
			assert.strictEqual(typeCombo.getValue().toLowerCase(), parameter.parameterType, "Now  dropdown is " + parameter.parameterType);
			var semDrop = sap.ui.getCore().byId(inputParameter.$().find(".dummyTest5")[0].id);
			assert.strictEqual(semDrop.getValue(), (parameter.inlineType.semanticType === "empty") ? "" : (parameter.inlineType.semanticType),
				"initially Sem Now  dropdown is" + semDrop.getValue());
			semDrop.setValue("Unit Of Measure");
			semDrop.fireChange({
				selectedItem: semDrop.getItems()[2]
			});
			sap.ui.getCore().applyChanges();
			assert.strictEqual(semDrop.getValue(), (parameter.inlineType.semanticType === "empty") ? "" : (parameter.inlineType.semanticType.replace(
				/([a-z])([A-Z])/g, '$1 $2')).replace("unit", "Unit"), "After updating Sem Now  dropdown is" + semDrop.getValue());
			/* var datCombo = sap.ui.getCore().byId(inputParameter.$().find(".dataComboTest")[0].id);
            assert.strictEqual(datCombo.getValue(), "", "initially data type Combo " + "");
            var lenth = sap.ui.getCore().byId(inputParameter.$().find(".lenthTest")[0].id);
            assert.strictEqual(lenth.getValue(), "13", "initially lenth field " + "13");
            var scale = sap.ui.getCore().byId(inputParameter.$().find(".scaleTest")[0].id);
            assert.strictEqual(scale.getValue(), "", "initially scale field " + "");
            var createIcon = sap.ui.getCore().byId(inputParameter.$().find(".createIconTest")[0].id);
            assert.strictEqual(createIcon.getEnabled(false), parameter.multipleSelections, "Default Value Table toobar Button  " + parameter.multipleSelections);
        */
		});
		QUnit.test("Parameter Type Direct Testcase Date Combo and Lenth Field & Scale Field", function() {
			var datCombo = sap.ui.getCore().byId(inputParameter.$().find(".dummyTest6")[0].id);
			datCombo.setValue(datCombo.getItems()[0].getKey());
			datCombo.fireChange({
				selectedItem: datCombo.getItems()[0]
			});
			sap.ui.getCore().applyChanges();

			equals(datCombo.getValue(), parameter.inlineType.primitiveType, "initially data type Combo " + datCombo.getValue());
			var lenth = sap.ui.getCore().byId(inputParameter.$().find(".dummyTest7")[0].id);
			equals(lenth.getValue(), parameter.inlineType.length, "initially length field value is " + parameter.inlineType.length);
			equals(lenth.getValueState(), "None", "initially length field value State is  " + "");
			datCombo.setValue(datCombo.getItems()[2].getKey());
			datCombo.fireChange({
				selectedItem: datCombo.getItems()[2]
			});

			sap.ui.getCore().applyChanges();
			equals(datCombo.getValue(), "INTEGER", "After updating  Date Combo field value is " + datCombo.getValue());
			equals(lenth.getValue(), "", "After updating  Date Combo field length field value is  " + "");
			equals(lenth.getValueState(), "Error", "After updating  Date Combo field length field value State is  " + lenth.getValueState());
			lenth.setValue(34);
			lenth.fireChange({
				newValue: 34
			});
			sap.ui.getCore().applyChanges();
			equals(lenth.getValue(), parameter.inlineType.length, "After updating  length field value is  " + lenth.getValue());
			equals(lenth.getValueState(), "None", "After updating  length field value State is  " + lenth.getValueState());
			var scale = sap.ui.getCore().byId(inputParameter.$().find(".dummyTest8")[0].id);
			equals(scale.getValue(), (parameter.inlineType.scale === undefined) ? "" : (parameter.inlineType.scale),
				"initially scale field value is " + parameter.inlineType.scale);
			scale.setValue(34);
			scale.fireChange({
				newValue: 34
			});
			sap.ui.getCore().applyChanges();
			equals(scale.getValue(), parameter.inlineType.scale, "After updating  scale field value is  " + scale.getValue());
		});
		QUnit.test("Default Table  Testcase", function() {
			
			var multiCheck = sap.ui.getCore().byId(inputParameter.$().find(".dummyTest3")[0].id);
			multiCheck.setChecked(true);
			multiCheck.fireChange({
				checked: true
			});
			sap.ui.getCore().applyChanges();
			var defaultTable = sap.ui.getCore().byId(inputParameter.$().find(".dummyTest15")[0].id);
			var derButt = sap.ui.getCore().byId(inputParameter.$().find(".dummyTest16")[0].id);
			var type = defaultTable.getRows()[0].getCells()[0];
			var value = defaultTable.getRows()[0].getCells()[1];
			ok(type.getValue(),"Initialy type column value is "+type.getValue());
			equals(type.getValue(), "Constant", "Type column value is Constant because So Expression was " + parameter.defaultRanges._values[0].lowExpression);
			equals(value.getValue(),"","Initialy value column value is "+value.getValue());
			value.setValue("12");
			value.fireChange({
				newValue:"12"
			});
			sap.ui.getCore().applyChanges();
			ok(value.getValue(),"After Update value column value is "+value.getValue());
			type.setValue(type.getItems()[1].getKey());
			type.fireChange({
				newValue:type.getItems()[1].getKey()
			});
			sap.ui.getCore().applyChanges();
			ok(type.getValue(),"After update  type column value is "+type.getValue());
				});
		QUnit.test("Parameter Type Column Testcase", function(assert) {
			typeCombo.setValue("Column");

			typeCombo.fireChange({
				newValue: "Column"
			});
			sap.ui.getCore().applyChanges();
			assert.strictEqual(typeCombo.getValue().toLowerCase(), parameter.parameterType.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase(),
				"Now  dropdown is " + parameter.parameterType);
			var valueHelp = sap.ui.getCore().byId(inputParameter.$().find(".inputBorder")[0].id);
			assert.strictEqual(valueHelp.getValue(), columnView.name + "(Current View)", "Value Help field value is " + columnView.name +
				"(Current View)");
			var referenceCombo = sap.ui.getCore().byId(inputParameter.$().find(".dummyTest9")[0].id);
			assert.strictEqual(referenceCombo.getValue(), (parameter.typeOfElement === undefined) ? "" : parameter.typeOfElement.name,
				"Initially Reference Combo is" + referenceCombo.getValue());
			referenceCombo.fireValueHelpRequest();
			sap.ui.getCore().applyChanges();
			count = 1;

		});

		QUnit.test("Parameter Type Column Testcase", function(assert) {
			var popUp = sap.ui.getCore().byId("__tree0");
			popUp.fireSelect({
				node: popUp.getNodes()[0].getNodes()[0]
			});
			sap.ui.getCore().applyChanges();
			var referenceCombo = sap.ui.getCore().byId(inputParameter.$().find(".dummyTest9")[0].id);
			assert.strictEqual(referenceCombo.getValue(), (parameter.typeOfElement === undefined) ? "" : parameter.typeOfElement.name,
				"After Updating  Reference Combo is" + referenceCombo.getValue());
			var hirarchiCombo = sap.ui.getCore().byId(inputParameter.$().find(".borderIconCombo")[0].id);
			equals(hirarchiCombo.getValue(), (parameter.hierarchy === undefined) ? " " : parameter.hierarchy.name, "Intialy Hirarchy Column field " +
				hirarchiCombo.getValue());
		});
		});